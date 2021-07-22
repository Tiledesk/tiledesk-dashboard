import { Injectable } from '@angular/core';
import { AppConfigService } from '../../services/app-config.service';
import { LogLevel } from '../../utils/util';
@Injectable()


export class LoggerService {
  // private logLevel: number = LogLevel.Debug
  private logLevel: number;
  constructor(
    public appConfigService: AppConfigService
  ) {

  }


  initilaizeLoger() {
    // if (environment.remoteConfig) {
    //   console.log("[LoggerService] current HERE REMOTE CONFIG ")
    //  this.appConfigService.loadAppConfig();
    //  const config = this.appConfigService.getConfig();
    //  console.log("[LoggerService] current HERE YES config ", config)
    // }



    const config = this.appConfigService.getConfig();
    // console.log("[LoggerService] current HERE YES config ", config)
    // console.log("[LoggerService] current HERE YES config loggingLevel", config.loggingLevel)

    if (config.loggingLevel !== undefined) {
      if (this.appConfigService.getConfig().loggingLevel) {
        this.logLevel = this.appConfigService.getConfig().loggingLevel
        // cons3ole.log("[LoggerService] current logLevel", this.logLevel)
        // this.setLoglevel(this.logLevel)
      } else {
        if (this.appConfigService.getConfig().loggingLevel === 0) {
          // console.log("[LoggerService] current HERE YES else 2 config loggingLevel", config.loggingLevel)
          this.logLevel = this.appConfigService.getConfig().loggingLevel
        }
      }
    } else {
      // console.log("[LoggerService] loggingLevel is undefined", config.loggingLevel)
      this.logLevel = 3 // debug
    }

  }


  // setLoglevel(logLevel: number) {
  //   this.logLevel = logLevel;
  //   console.log("[LoggerService] setLoglevel logLevel", logLevel)
  // }

  // getLoglevel() { 
  //   console.log("[LoggerService] getLoglevel logLevel", this.logLevel)
  //   return this.logLevel 

  // }

  error(...message: any[]) {
    if (this.logLevel >= LogLevel.Error) {
      console.error(message)
    }
  }

  warn(...message: any[]) {
    if (this.logLevel >= LogLevel.Warn) {
      console.warn(message)
    }
  }

  info(...message: any[]) {
    if (this.logLevel >= LogLevel.Info) {
      console.info(message)
    }
  }

  debug(...message: any[]) {
    if (this.logLevel >= LogLevel.Debug) {
      console.debug(message)
    }
  }

  log(...message: any[]) {
    if (this.logLevel >= LogLevel.Debug) {
      console.log(message)
    }
  }

  // debug(...args: any[]) {
  //   if (this.logLevel == this.LEVEL_DEBUG) {
  //     console.debug.apply(console, args)
  //   }
  // }

  // log(...args: any[]) {
  //   if (this.logLevel == this.LEVEL_DEBUG) {
  //     console.log.apply(console, args)
  //   }
  // }

  // info(...args: any[]) {
  //   if (this.logLevel <= this.LEVEL_INFO) {
  //     console.info.apply(console, args)
  //   }
  // }

  // error(...args: any[]) {
  //   // if (this.logLevel <= LEVEL_ERROR) {
  //   console.error.apply(console, args)
  //   // }
  // }


}
