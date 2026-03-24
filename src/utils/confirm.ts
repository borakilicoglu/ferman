import readline from "node:readline";

export async function confirmKill(port: number): Promise<boolean> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return false;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(`Terminate processes using port ${port}? [y/N] `, resolve);
  });

  rl.close();

  return /^(y|yes)$/i.test(answer.trim());
}
