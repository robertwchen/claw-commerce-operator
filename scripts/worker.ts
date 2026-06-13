import { Queue, Worker } from "bullmq";
import { runAutopilot } from "@/lib/engine/autopilot";
import { mutateState } from "@/lib/state/demo-state";

const queueName = "claw-commerce-operator";

async function runInline() {
  await mutateState(async (draft) => {
    const result = await runAutopilot(draft, "dry_run");
    return result.state;
  });
  console.log("Redis URL not set; completed one inline dry-run worker job.");
}

async function main() {
  if (!process.env.REDIS_URL) {
    await runInline();
    return;
  }

  const redisUrl = new URL(process.env.REDIS_URL);
  const connection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
  };
  const queue = new Queue(queueName, { connection });
  await queue.add("autopilot:dry", { mode: "dry_run" });

  const worker = new Worker(
    queueName,
    async (job) => {
      await mutateState(async (draft) => {
        const result = await runAutopilot(draft, job.data.mode);
        return result.state;
      });
      return { ok: true };
    },
    { connection },
  );

  worker.on("completed", async (job) => {
    console.log(`Completed ${job.name}.`);
    await worker.close();
    await queue.close();
    process.exit(0);
  });

  worker.on("failed", async (_job, error) => {
    console.error(error);
    await worker.close();
    await queue.close();
    process.exit(1);
  });
}

main().catch(async (error) => {
  console.warn("Redis worker unavailable; running one inline dry-run job instead.");
  console.warn(error instanceof Error ? error.message : error);
  await runInline();
});
