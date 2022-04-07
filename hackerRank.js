const puppeteer = require('puppeteer');
const {email,pass}  = require('./secrets');
const {answer} = require('./codes')

let cTab;
let browserOpenPromise = puppeteer.launch({
    //headless is for viewing what is happened automatically
    //default value is true where it happens automatically without showing
    headless:false,
    defaultViewport:null,
    args:["--start-maximized"],
    //we need to fix the path of the of the browser 
    executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
});

browserOpenPromise.then((browser)=>{
    console.log("browser is open");
    //we have now the the way to open the browser
    //now get the all tabs of the browser
    let allBrowerTabsPromise = browser.pages();
    return allBrowerTabsPromise;
}).then((tabsArray)=>{
//we get the way to control first tab
cTab = tabsArray[0];
console.log("new tab opened");
//goto will used to open a url at current tab
let loginPagePromise = cTab.goto("https://www.hackerrank.com/auth/login");
return loginPagePromise;
}).then(()=>{
    console.log("hackerrank login page opened successfully");
    //now type will find the input using attributes selector and add email store in it
    let emailTypePromise = cTab.type("input[name='username']",email);
    return emailTypePromise;
}).then(()=>{
    console.log("email typed successfully");
                                        //selector            //data
    let passwordTypePromise = cTab.type("input[name='password']",pass);
    return passwordTypePromise;
}).then(()=>{
    console.log("password typed successfully");
                                      //selector
    let loggedInPromise = cTab.click(".ui-btn.ui-btn-large.ui-btn-primary.auth-button.ui-btn-styled");
    return loggedInPromise;
}).then(()=>{
    console.log("logged into new page");
    //some time it need to be load the page to acces some thing so thats why we made a custom promise to wait and click
    //the algorithm
    let algorithmTabWillBeOPenedPromise = waitAndClick("div[data-automation='algorithms']");
    return algorithmTabWillBeOPenedPromise;
}).then(()=>{
    console.log("algorithm page is opnened.");
    //now we want to fetch the list of question links
    let allQuesPromise = cTab.waitForSelector( 'a[data-analytics="ChallengeListChallengeName"]');
    return allQuesPromise;
})
.then(()=>{
    //we created a function because we have to return promise instead of return link array
    //if we return array we dont use .then and thats why evaluate function is use to return the array when promise is fullfiled

    function getAllQuesLinks() {
        let allElemArr = document.querySelectorAll(
          'a[data-analytics="ChallengeListChallengeName"]'
        );
        let linksArr = [];
        for (let i = 0; i < allElemArr.length; i++) {
          linksArr.push(allElemArr[i].getAttribute("href"));
        }
        return linksArr;
      }
      //evaluate function will return promise as it is asynchronous  
      let linksArrPromise = cTab.evaluate(getAllQuesLinks);
      return linksArrPromise;
})
.then((linksArr)=>{
console.log("All questions array recieved");
//now have to solve each question
let questionWillBeSolved = questionSolver(linksArr[0],0);
return questionWillBeSolved;
})
.then(()=>{
    console.log("question is solved");
})
.catch((err)=>{
    console.log(err);
})


function  questionSolver(quesLink,ind){
    return new Promise(function(resolve,reject){
        let fullLink = `https://www.hackerrank.com${quesLink}`
        let questionOpenPromise = cTab.goto(fullLink);
        questionOpenPromise.then(()=>{
            console.log("question opened..");
            //now we need to tick the check box
            let waitForCheckBoxAndClick = waitAndClick(".checkbox-input");
            return waitForCheckBoxAndClick;
        }).then(()=>{
            //select the box where code will be typed
            let waitForTextBoxPromise = cTab.waitForSelector(".custominput");
            return waitForTextBoxPromise;
        }).then(()=>{
            let codeWillBeTypedPromise = cTab.type(".custominput",answer[ind]);
            return codeWillBeTypedPromise;
        }).then(()=>{
            //control key + a to select data from the custom input
            let controlKeyPressPromise = cTab.keyboard.press("Control");
            return controlKeyPressPromise;
        }).then(()=>{
            let aKeyPressPromise = cTab.keyboard.press("a");
            return aKeyPressPromise;
        }).then(()=>{
            let unpressAPromise = cTab.keyboard.up("a");
            return unpressAPromise;
        })
        .then(()=>{
            let xKeyPressPromise = cTab.keyboard.press("x");
            return xKeyPressPromise;
        }).then(()=>{
            let unpressXPromise = cTab.keyboard.up("x");
            return unpressXPromise;
        })
        .then(()=>{
            // ".monaco-editor.no-user-select.vs
            let cursorOnEditorPromise = cTab.click(".monaco-editor.no-user-select.vs");
            return cursorOnEditorPromise;
        }).then(() => {
            let aKeyPressPromise = cTab.keyboard.press('a');
            return aKeyPressPromise;
        })
        .then(()=>{
            let unpressAPromise = cTab.keyboard.up("a");
            return unpressAPromise;
        })
        .then(() => {
            let vKeyPressPromise = cTab.keyboard.press('v');
            return vKeyPressPromise;
        })
        .then(()=>{
            let unpressVPromise = cTab.keyboard.up("v");
            return unpressVPromise;
        }).then(() => {
            let submitButtonClickPromise = cTab.click(".hr-monaco-submit");
            return submitButtonClickPromise;
        }).then(() => {
            let unpressControlPromise = cTab.keyboard.up("Control");
            return unpressControlPromise;
        }).then(()=>{
            console.log("code submitted successfully");
            resolve();
        })
        .catch((err) => {
            reject(err);
        });
    });
}

function waitAndClick(algoBtn){
    let waitClickPromise =  new Promise((resolve, reject)=>{
                                        //in built function for loading of the page 
        let waitForSelectorPromise = cTab.waitForSelector(algoBtn);
        waitForSelectorPromise.then(()=>{
            console.log("algo btn is found");
            let clickPromise = cTab.click(algoBtn);
            return clickPromise;
        })
        .then(()=>{
            console.log("algo btn is clicked");   
            resolve();    
        })
        .catch((err)=>{
            console.log(err);
            reject();
        })
    })
    //
    return waitClickPromise;
}