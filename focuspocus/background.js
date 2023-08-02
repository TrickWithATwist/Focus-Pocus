//test

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
        else
        {
            //if not then link will remain an undefined value until something has been saved to local storage
            null;
        }
    })
}

//using these functions before chrome listesns for events
getonoffstatus();
loadlink();

//lisenting for messages
chrome.runtime.onMessage.addListener(data =>
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
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) =>
                {
                    if(tabs && tabs.length > 0)
                    {
                        link = tabs[0].url;
                        addlink();
                    }
                });
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
            case "default":
                //empty
            break;
        }
        

    }
    )


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