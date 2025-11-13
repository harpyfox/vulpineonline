export default async function(eleventyConfig) {
    eleventyConfig.setInputDirectory("eleventy_input");
    eleventyConfig.setIncludesDirectory("../eleventy_includes");
    eleventyConfig.setDataDirectory("../eleventy_data");
    eleventyConfig.setOutputDirectory("public");

    eleventyConfig.setFrontMatterParsingOptions({
        language: "json",
    });
    eleventyConfig.setTemplateFormats([ "njk", "html" ]);

    eleventyConfig.setNunjucksEnvironmentOptions({
        autoescape: false,
        throwOnUndefined: true,
    });
    eleventyConfig.addNunjucksGlobal("img", function(src, attrs) {
        return `<img ${attrs} src="${src}" loading="lazy" >`;
    })
    eleventyConfig.addNunjucksGlobal("video", function(src, attrs) {
        return `<video ${attrs} src="${src}" preload="none" poster="../img/mediaplayer48.png"></video>`;
    })
}

export const config = {
    htmlTemplateEngine: "njk",
};


