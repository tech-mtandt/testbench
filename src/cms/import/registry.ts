import { companyTasks } from "./tasks/company";
import { homeTasks } from "./tasks/home";
import { mediaTasks } from "./tasks/media";
import { pagesTasks } from "./tasks/pages";
import { catalogUpdateTask } from "./tasks/catalogUpdate";
import { dbUpdatesTask } from "./tasks/dbUpdates";
import { landingPagesTask } from "./tasks/landingPages";
import { mergePreviewTask, mergeTask } from "./tasks/mergeBuyRent";
import { productsTasks } from "./tasks/products";
import { siteTasks } from "./tasks/site";
import type { ImportTask } from "./types";

/** Run order matters: products taxonomy before products, etc. Each area orders its own. */
export const tasks: ImportTask[] = [
  dbUpdatesTask,
  ...siteTasks,
  ...homeTasks,
  ...pagesTasks,
  ...companyTasks,
  ...mediaTasks,
  ...productsTasks,
  catalogUpdateTask,
  mergePreviewTask,
  mergeTask,
  landingPagesTask,
];
