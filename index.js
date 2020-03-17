module.exports = (request, response) => {
  const { url } = request
  const urlParts = url.split('/')

  if (url === '/') {
    response.writeHead(302, {
      Location: `https://blog.expo.io`
    })

    response.end()
    return
  }

  if (urlParts.length > 2) {
    return {
      error: 'Invalid URL provided, should be in the form https://expo.fyi/slug-for-info-page-here',
      errorHandle: 'missing_data'
    }
  }


  const code = urlParts[1];

  response.writeHead(302, {
    Location: `https://github.com/expo/fyi/blob/master/${code}.md`
  })

  response.end()
}
