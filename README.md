hjghghdfghdf

### DEV SERVER!!!!!
```
uv run pywrangler dev
```

### RENDER PAGES!!!!
```
python3 renderer.py
```
pages have METADATA in the form on a JSON block at the tippy top.
```
{
    "title": "my awesome web page",
    "summary": "it's the best"
}
<html>
    <head>
        <title>{{ title }}</title>
```
like that

"isn't this the same as Eleventy" yes but i dont want to use eleventy or npm or node or javascript

### UPDATE TYPS!!!!!!!!!
```
uv run pywrangler types
```