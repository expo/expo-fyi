module.exports = (request, response) => {
  const { url } = request
  const urlParts = url.split('/')

  if (url === '/') {
    response.writeHead(302, {
      Location: `https://github.com/expo/fyi`
    })

    response.end()
    return
  }

  if (urlParts.length > 2) {
    // who cares? try anyways
  }


  const code = urlParts[1];

  response.writeHead(302, {
    Location: `https://github.com/expo/fyi/blob/master/${code}.md`
  })

  response.end()
}