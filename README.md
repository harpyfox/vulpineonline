hjghghdfghdf

### DDEV DEPENDEDNECIES
- uv
- PYTHON 
- jinja2

### DEV SERVER
```
uv run pywrangler dev
```

### RENDER PAGES!!!!
```
uv run render.py
```
pages have METADATA in the form of a ~~JSON~~ raw Python block at the tippy top. 
trailing commas come to mumma. it is parsed via ast.literal_eval.
```
{
    "title": "my awesome web page",
    "summary": "it's the best",
    "author": "not json get FUCKED",
}
<html>
    <head>
        <title>{{ title }}</title>
```
like that

"isn't this the same as Eleventy" yes but i dont want to use eleventy or npm or node or javascript

### UPDATE TYPEs i dont know what this ctually does 
```
uv run pywrangler types
```

### CHECKLIST
- [x] Witch
- [x] Pollo
- [x] Haunted
- [x] HSALPHA
- [x] Misc
- [x] Debugdog
- [x] Kaiju
- [x] Roborb
- [ ] Rockets
- [ ] Zoo
- [ ] Inktober2025
- [ ] Reptilian
- [ ] TMOSI