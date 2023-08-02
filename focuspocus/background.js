//test
//instructionurl defined?
var instructionurl = "https://www.youtube.com/watch?v=0XkC1AYATns&ab_channel=TrickWithATwist";

//establish essential variable current url
var currenturl;

//on/off button stuff
//0 = off 1 = on
var onoffstatus;


//function asynchronously loading in data hopefully?
//if button has already been pressed then the value that has been saved to the local storage will be new value
//for onoffstatus else the program will go on as usual as if onoffstatus is equal to 0
const getonoffstatus = () =>
{
    chrome.storage.local.get(["status"]).then((value) =>
        {
            if(value.status !== undefined)
            {
                onoffstatus = value.status;
            }
            else
            {
                onoffstatus = 0;
            } 
        })
}


//varible for the url data and stuff
var link; 
//function for asynchronously loading in data for link if there is need to do that
const loadlink = () =>
{
    //value of link will be defined if there has been a link that has been saved to local storage
    chrome.storage.local.get(["keylink"]).then((value) =>
    {
        if(value.keylink !== undefined)
        {
            //if there is a link that has been saved to local storage then that link will be equal to that 
            console.log("link data get successful")
            link = value.keylink;
        }
    })
}

//using these functions before chrome listesns for events
getonoffstatus();
loadlink();

//lisenting for messages
chrome.runtime.onMessage.addListener( async data =>
    {
        const{event} = data
        switch(event)
        {
            case "onoff":
                //code to toggle in between on and off for the button and then save it 
                onoffstatus = 1 - onoffstatus;
                console.log(onoffstatus);
                handlestatus();
            break;
            case "add":
                link = await getCurrentTabURL();
                addlink();
                //delay 
                await new Promise(resolve => setTimeout(resolve, 0));
                console.log("link saved:", link);
                //link will be added to local storage data via function
            break;
            case "debug":
                //this case logs different values to console to see variable values
                if (link !== undefined)
                {
                    console.log("Link")
                    console.log(link);
                }
                console.log("OnOffStatus");
                console.log(onoffstatus);

            break;
            case "clearbutton":
                //clearbutton event stuff
                //if the forget url button has been pressed and there was a link saved
                //the link will be removed from the local storage
                if(link !== undefined)
                {
                    removelink();
                    link = undefined;
                }
            break;
            case "instructions":
                //creates new tab that leads to website with instructions
                //FOR DEV: instructions webiste has not been made so this will redirect to placeholder website instead.
                chrome.tabs.create({url: instructionurl});
            break;
            case "default":
                //empty
            break;
        }
        

    }
    )



//if a tab has been created
chrome.tabs.onCreated.addListener(async () =>
{

    //check the url if it is not instructions or the saved url then redirect if onoffstatus = 1
    //establishing variable that represents current url 
    currenturl = await getCurrentTabURL();
    if((currenturl !== link) && (currenturl !== instructionurl))
    {
        if(onoffstatus == 1)
        {
            chrome.tabs.update({url: link});
        }
    }

})
//functions
const handlestatus = () =>
{
    const data = {status: onoffstatus};
    //put this here to make sure that the code is actually working idk
    console.log("data has been saved", onoffstatus); 
    chrome.storage.local.set(data);
}

//function to add link to storage so that when the extension is running it can remember what web page user wants to 
//focus on
const addlink = () =>
{
    //setting data for the url that is going to be focused on 
    chrome.storage.local.set({keylink: link}).then(() =>
    {
        console.log("link saved", link);
    })
}

//function to remove link from local storage
const removelink = () =>
{
    //removing the value from the key or something idk 
    try
    {
        chrome.storage.local.remove(["keylink"]);
    }
    catch(err)
    {
        console.log("idk there was an error or something ig you shouldn't remove a link that you didn't even add you dingus")
    }
}

//function to get current URL (modified version of example code from chrome API documentation)
async function getCurrentTabURL() 
{
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tabs` will be an array containing the active tab (if found) or an empty array.
    let tabs = await chrome.tabs.query(queryOptions);
    if (tabs.length > 0) 
    {
      // Return the URL of the first tab (active tab)
      return tabs[0].url;
    } 
    else 
    {
      // Return null or any other value to indicate no active tab is found
      return null;
    }
}