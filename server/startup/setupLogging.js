/*
 * Copyright 2021, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { dayjs, log } from "../deps.js";
import conf from "../conf.js";

export default async () => {
  const lc = conf().logging;

  await log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler(lc.console.level, {
        formatter: (rec) => {
          return `[${rec.levelName}] ${rec.msg}`
        }
      }),

      file: new log.handlers.RotatingFileHandler(lc.file.level, {
        maxBytes: lc.file.maxBytes,
        maxBackupCount: lc.file.maxBackupCount,
        filename: lc.file.filename,
        mode: lc.file.mode,
        formatter: (rec) => {
          const date = dayjs(rec.datetime).format(lc.file.dateFormat);
          return `[${date} ${rec.levelName.padEnd(8)}] ${rec.msg}`
        }
      }),
    },

    loggers: {
      default: {
        level: "DEBUG",
        handlers: ["console", "file"],
      },
    },
  });
};
