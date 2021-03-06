import * as cssNodeExtract from 'css-node-extract';
import * as fs from 'fs';
import * as postcssSyntax from 'postcss-scss';

import {
  buildIncludePaths,
  cleanImportUrl,
  parseNodeFilters,
  resolveUrl,
} from 'node-sass-magic-importer/dist/toolbox';
import { defaultOptions } from './default-options';

import { IFilterImporterOptions } from 'node-sass-magic-importer/dist/interfaces/IImporterOptions';

export = function nodeImporter(userOptions?: IFilterImporterOptions) {
  const options = Object.assign({}, defaultOptions, userOptions);

  return function importer(url: string, prev: string) {
    const nodeSassOptions = this.options;
    const nodeFilters = parseNodeFilters(url);

    if (nodeFilters.length === 0) {
      return null;
    }

    const includePaths = buildIncludePaths(
      nodeSassOptions.includePaths,
      prev,
    );

    const cleanedUrl = cleanImportUrl(url);
    const resolvedUrl = resolveUrl(cleanedUrl, includePaths);
    const css = fs.readFileSync(resolvedUrl, { encoding: `utf8` });
    const contents = cssNodeExtract.processSync({
      css,
      filters: nodeFilters,
      customFilters: options.customFilters,
      postcssSyntax,
      preserveLines: true,
    });

    return contents ? {
      file: resolvedUrl,
      contents,
    } : null;
  };
};
