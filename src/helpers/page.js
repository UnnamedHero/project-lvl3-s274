import cheerio from 'cheerio';
import path from 'path';
import { makeResourceNameFromUrl } from './name';

const isStartFromSchema = link => link.search(new RegExp('^(https?://)', 'g')) !== -1;

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

export const makePageHelper = html => cheerio.load(html);

export const getPageHtml = helper => helper.html();

export const getPageLinks = helper => resourceElements
  .reduce((acc, resource) => {
    const elementLinks = helper(resource.name)
      .map((_, elem) => cheerio(elem).attr(resource.attribute))
      .get();
    return [...acc, ...elementLinks];
  }, []);

export const getLocalPageLinks = helper => getPageLinks(helper)
  .filter(link => !isStartFromSchema(link));

export const changeLocalResourcesSourceTo = (helper, newPath) => {
  resourceElements.forEach((element) => {
    helper(element.name).each((_, elem) => {
      const link = cheerio(elem).attr(element.attribute);
      if (link && !isStartFromSchema(link)) {
        const newLink = makeResourceNameFromUrl(link);
        const fullPath = path.join(newPath, newLink);
        cheerio(elem).attr(element.attribute, fullPath);
      }
    });
  });
};
