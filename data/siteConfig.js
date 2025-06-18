export const siteConfig = {
    metaTitle: "metaTitle",
    metaDescription: "metaDescription",
    ogTitle: "metaTitle",
    ogDescription: "metaDescription",
    ogUrl: "https://",
    ogImage: "images/pic01.jpg",
    logo: "images/logo.jpg",
    favicon: "images/favicon.ico",
    title: "Title",
	showMenu: false,
    showMap: true,
    showShuffleCollections: true,
    showTopBanner: true,
    showScrollToTop: true,
    ableDarkMode: true,
    topBannerContent: ``,
    rrss: 
    [
        { name: "RS name", url: "RS LINK" }
    ],
    showFriends: true,
    friends: 
    [
        { name: "BFF", url: "https://" }
    ],
    staticPages: [
        {
			key: 'aboutme',
			file: 'about-me.html',
			content: `<h1>Hello world</h1>`,
			metaDescription: "metaDescription",
			metaTitle: "metaTitle"
        }
    ],
    menu: 
    [
        { name: "Home", link: "index.html" }
    ],
    footerCopyright: [ 
    `Based on design: <a href="http://html5up.net" target="_blank">HTML5 UP</a>`],
    collectionDaysNew: 10,
    collectionsDaysUpdated:10,
    own_script: `
    <script>
    
    </script>`,
    analytics_script:` `
}
