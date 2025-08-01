import index from "./public/index.html";

export default {
  async fetch(request, env) {

    const url = new URL(request.url);
		console.log(`Hello ${navigator.userAgent}!\n`
    + `Welcome to ${url.hostname} specifically ${url.pathname}!\n` 
    + `Your ${url.protocol} ${request.method} request is very nice\n`
    + ``);

    // const location = `https://bsky.app/profile/harpyfox.net/post/3lrppfou7z22r`;
    // return a redirect yipee yipee
    // return Response.redirect(location, 302);
    
    return new Response(index, {
      headers: {
        "Content-Type": "text/html",
      },
    });


  }
};
