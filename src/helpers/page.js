import cheerio from 'cheerio';
import path from 'path';
import uniq from 'lodash/uniq';
import { makeResourceNameFromUrl } from './name';

const isAbsoluteUrl = link => link.search(new RegExp('(^(.+)?//)', 'g')) !== -1;

const resourceElements = [
  {
    name: 'link',
    attribute: 'href',
  },
  {
    name: 'script',
    attribute: 'src',
  },
  {
    name: 'img',
    attribute: 'src',
  },
];

export const makePage = html => cheerio.load(html);

export const getPageHtml = helper => helper.html();

export const getPageLinks = helper => resourceElements
  .reduce((acc, resource) => {
    const elementLinks = helper(resource.name)
      .map((_, elem) => cheerio(elem).attr(resource.attribute))
      .get();
    const uniqLinks = uniq(elementLinks);
    return [...acc, ...uniqLinks];
  }, []);

export const getPagaeLocalLinks = helper => getPageLinks(helper)
  .filter(link => !isAbsoluteUrl(link));

export const changePageLocalLinksTo = (helper, newPath) => {
  resourceElements.forEach((element) => {
    helper(element.name).each((_, elem) => {
      const link = cheerio(elem).attr(element.attribute);
      if (link && !isAbsoluteUrl(link)) {
        const newLink = makeResourceNameFromUrl(link);
        const fullPath = path.join(newPath, newLink);
        cheerio(elem).attr(element.attribute, fullPath);
      }
    });
  });
};
