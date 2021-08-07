const URL = "http://localhost:3000/tweets";
let nextPageUrl=null;
/**
 * Retrive Twitter Data from API
 */

const onenter=(e)=>{
    if(e.key=="Enter"){
        getTwitterData();
    }
}
const onNextPage=()=>{
    if (nextPageUrl) {
        getTwitterData(true); 
    }
    
}
const getTwitterData = (nextPage=false) => {
    const query=document.getElementById('user-search-input').value;
     if(!query)return;
     const encodedquery=encodeURIComponent(query);
    let fullurl=`${URL}?q=${encodedquery}&count=10`;
    if(nextPage && nextPageUrl){
        fullurl=nextPageUrl;
    }
 fetch(fullurl).then((response)=>{
     return response.json();
 }).then((data)=>{
     buildTweets(data.statuses,nextPage);
     saveNextPage(data.search_metadata);
     nextPageButtonVisibility(data.search_metadata);
 })
}

/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
    if(metadata.next_results){
        nextPageUrl=`${URL}${metadata.next_results}`;
    }
    else{
        nextPageUrl=null;
    }
}

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (e) => {
    const text=e.innerText;
    document.getElementById('user-search-input').value=text;
    getTwitterData();
}

/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
    if (metadata.next_results) {
        document.getElementById('next-page ').style.visibility="visible";
    }
    else{
        document.getElementById('next-page ').style.visibility="hidden";   
    }
}

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, nextPage) => {
let twittercontent="";
tweets.map((tweet )=>{
    const createddate=moment().from(tweet.created_at);
    twittercontent+=` 
    <div class="tweet-container">
    <div class="tweet-user-info">
                    <div class="tweet-user-profile" style="background-image: url(${tweet.user.profile_image_url_https})"></div>
                    <div class="tweet-user-name-container">
                        <div class="tweet-user-fullname">${tweet.user.name}</div>
                        <div class="tweet-user-username">@${tweet.user.screen_name}</div>
                    </div>
                </div>
    `

    if(tweet.extended_entities && tweet.extended_entities.media.length > 0){
       twittercontent += buildImages(tweet.extended_entities.media);
       twittercontent+=buildVideo(tweet.extended_entities.media);
    }

    twittercontent +=`
    <div class="tweet-text-container">
        ${tweet.full_text}
    </div>
    <div class="tweet-date-container">
        ${createddate}
    </div>
</div>`
});
if (nextPage) {
    document.querySelector('.tweets-list').insertAdjacentHTML('beforeend',twittercontent);
}else{
    document.querySelector('.tweets-list').innerHTML=twittercontent;
}

}

/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
    let imagesContent=`<div class="tweet-images-container">`;
    let imageexists=false;
    mediaList.map((media)=>{
        if(media.type=="photo"){
            imageexists=true;
            imagesContent+=`<div class="tweet-image" style="background-image : url(${media.media_url_https}"></div>`;
        }
    });
    imagesContent+=`</div>`;
    return imageexists? imagesContent:'';

}

/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
    let videoContent=`<div class="tweet-vedio-container">`;
    let videoexists=false;
    mediaList.map((media)=>{
        if(media.type=="video"){
         videoexists=true;
            videoContent+=`
           <video  controls>
               <source src="${media.video_info.variants[0].url}" type="video/mp4">
             </video>
            `
        }
        else if(media.type=="animated_gif"){
            videoexists=true;
            videoContent+=`
           <video loop autoplay>
               <source src="${media.video_info.variants[0].url}" type="video/mp4">
             </video>
            `
        }
    });
    videoContent+=`</div>`;
    return videoexists? videoContent:'';
}
