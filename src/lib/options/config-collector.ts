import { cosmiconfigSync } from 'cosmiconfig';

import {
  ConvertionType,
  FileConvertionOptions,
  ObjectConvertionOptions,
  ConstantsConvertionOptions
} from './convertion-options';
import { DEFAULT_OPTIONS } from './default-options';

import * as packgeJSON from '../../../package.json';
import { error, info } from '../helpers/log-helper';
import { getSvgoConfig } from '../helpers/svg-optimization';
import { Delimiter } from '../generators/code-snippet-generators';

export const collectConfigurationOptions = async (): Promise<
  ConstantsConvertionOptions | FileConvertionOptions | ObjectConvertionOptions | null
> => {
  const explorerSync = cosmiconfigSync(packgeJSON.name);
  const cosmiConfigResult = explorerSync.search();
  cosmiConfigResult ? info(`Configuration found under: ${cosmiConfigResult.filepath}`) : info('No config found');
  return cosmiConfigResult ? await mergeWithDefaults(cosmiConfigResult.config) : null;
};

const mergeWithDefaults = async (
  options
): Promise<FileConvertionOptions | ConstantsConvertionOptions | ObjectConvertionOptions> => {
  const configOptions = { ...options };

  if (!options.convertionType) {
    error(`A convertionType is required, please specify one by passing it via --convertionType. 
    Valid convertiontypes are (object, constants or files)`);
    process.exit();
  }

  if (!configOptions.outputDirectory) {
    configOptions.outputDirectory = DEFAULT_OPTIONS.outputDirectory;
    info(`No outputDirectory provided, "${DEFAULT_OPTIONS.outputDirectory}" will be used`);
  }

  if (!configOptions.srcFiles) {
    configOptions.srcFiles = DEFAULT_OPTIONS.srcFiles;
    info(`No srcFiles provided, "${DEFAULT_OPTIONS.srcFiles}" will be used`);
  }

  if (!configOptions.svgoConfig) {
    configOptions.svgoConfig = DEFAULT_OPTIONS.svgoConfig;
    info(`No svgoConfig provided, default configuration will be used`);
  } else {
    configOptions.svgoConfig = await getSvgoConfig(configOptions.svgoConfig);
  }

  if (!configOptions.delimiter) {
    configOptions.delimiter = options.convertionType === ConvertionType.OBJECT ? Delimiter.CAMEL : Delimiter.SNAKE;
    info(`No delimiter provided, "${configOptions.delimiter}" will be used`);
  }

  if (options.convertionType === ConvertionType.OBJECT) {
    info(`Convertiontype "Object" will be used`);

    if (!(configOptions as ObjectConvertionOptions).objectName) {
      configOptions.outputDirectory = DEFAULT_OPTIONS.objectName;
      info(`No outputDirectory provided, "${DEFAULT_OPTIONS.objectName}" will be used`);
    }
  }

  if (options.convertionType === ConvertionType.CONSTANTS || options.convertionType === ConvertionType.OBJECT) {
    if (!(configOptions as ConstantsConvertionOptions).fileName) {
      (configOptions as ConstantsConvertionOptions).fileName = DEFAULT_OPTIONS.modelFileName;
      info(`No fileName provided, "${DEFAULT_OPTIONS.modelFileName}" will be used`);
    }
  }

  if (options.convertionType === ConvertionType.CONSTANTS || options.convertionType === ConvertionType.FILES) {
    if (!configOptions.typeName) {
      configOptions.typeName = DEFAULT_OPTIONS.typeName;
      info(`No typeName provided, "${DEFAULT_OPTIONS.typeName}" will be used`);
    }

    if (configOptions.generateType === null) {
      configOptions.generateType = DEFAULT_OPTIONS.generateType;
      info(`No generateType provided, "${DEFAULT_OPTIONS.generateType}" will be used`);
    }

    if (configOptions.generateTypeObject === null) {
      configOptions.generateTypeObject = DEFAULT_OPTIONS.generateTypeObject;
      info(`No generateTypeObject provided, "${DEFAULT_OPTIONS.generateTypeObject}" will be used`);
    }

    if (!configOptions.interfaceName) {
      configOptions.interfaceName = DEFAULT_OPTIONS.interfaceName;
      info(`No interfaceName provided, "${DEFAULT_OPTIONS.interfaceName}" will be used`);
    }

    if (typeof configOptions.prefix !== 'string') {
      configOptions.prefix = DEFAULT_OPTIONS.prefix;
      info(`No prefix provided, "${DEFAULT_OPTIONS.prefix}" will be used`);
    }
  }

  if (configOptions.convertionType === ConvertionType.FILES) {
    if (!(configOptions as FileConvertionOptions).modelFileName) {
      (configOptions as FileConvertionOptions).modelFileName = DEFAULT_OPTIONS.modelFileName;
      info(`No modelFileName provided, "${DEFAULT_OPTIONS.modelFileName}" will be used`);
    }

    if (!(configOptions as FileConvertionOptions).iconsFolderName) {
      (configOptions as FileConvertionOptions).iconsFolderName = DEFAULT_OPTIONS.iconsFolderName;
      info(`No iconsFolderName provided, "${DEFAULT_OPTIONS.iconsFolderName}" will be used`);
    }

    if (!(configOptions as FileConvertionOptions).compileSources) {
      (configOptions as FileConvertionOptions).compileSources = DEFAULT_OPTIONS.compileSources;
      info(`No preCompileSources flag provided, "${DEFAULT_OPTIONS.compileSources}" will be used`);
    }
    return configOptions as FileConvertionOptions;
  }
  return configOptions as ConstantsConvertionOptions;
};
