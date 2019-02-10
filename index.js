exports.handlers = {
  parseComplete: ({doclets}) => {
    const scopes = {inner: '~', static: '.', instance: '#'}
    const members = {}
    const augments = {}
    const undocumented = new Map()

    doclets.forEach(doclet => {
      members[doclet.longname] = doclet
      if(doclet.augments && doclet.augments.length) augments[doclet.longname] = doclet.augments[0]
    })

    doclets.forEach(doclet => {
      if(doclet.undocumented && doclet.memberof in augments) {
        const parent = members[`${augments[doclet.memberof]}${scopes[doclet.scope]}${doclet.name}`]
        if(parent) undocumented.set(doclet, parent)
      }
    })

    while(undocumented.size) {
      undocumented.forEach((parent, doclet) => {
        if(undocumented.has(parent)) return
        if(!parent.undocumented) {
          parent = JSON.parse(JSON.stringify(parent))
          delete parent.meta
          delete parent.name
          delete parent.longname
          delete parent.kind
          delete parent.memberof
          delete parent.scope
          delete doclet.undocumented
          Object.assign(doclet, parent)
        }

        undocumented.delete(doclet)
      })
    }
  }
}
