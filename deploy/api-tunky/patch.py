p = "/opt/api-tunky/src/server.js"
s = open(p).read()
if 'require("./pais")' not in s:
    ancla = 'Object.assign(routes, makeCounter({ DATA_DIR, json, clean, readBody }));\n'
    assert ancla in s, "ancla no encontrada"
    s = s.replace(ancla, ancla + 'const makePais = require("./pais");\nObject.assign(routes, makePais({ DATA_DIR, json, clean, readBody }));\n', 1)
    open(p, "w").write(s)
    print("parcheado")
else:
    print("ya estaba")
