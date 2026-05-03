import chalk from "chalk";

export const logger = {
  info(message: string): void {
    console.log(chalk.cyan(message));
  },
  success(message: string): void {
    console.log(chalk.green(`✓ ${message}`));
  },
  warn(message: string): void {
    console.warn(chalk.yellow(`Warning: ${message}`));
  },
  error(message: string): void {
    console.error(chalk.red(`Error: ${message}`));
  },
  muted(message: string): void {
    console.log(chalk.gray(message));
  },
  section(title: string): void {
    console.log("");
    console.log(chalk.bold(title));
  }
};

export function maskSecret(value: string): string {
  if (!value) {
    return "";
  }

  if (value.length <= 8) {
    return "****";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
