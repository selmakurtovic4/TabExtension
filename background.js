let counter = 0;
let data = []; // Store windows and their tabs

let closedData=[];

//krairanje taba
chrome.tabs.onCreated.addListener((tab) => {
  counter++; 
  const element = {
    id: tab.id,
    title: tab.title, 
    url: tab.url,
    time: new Date().toString(), 
    numOfClicks: 0,
  };
  console.log("tab je kreiran");

  // Find the window corresponding to the tab's windowId
  const windowData = data.find((window) => window.windowId === tab.windowId);
 
  if (windowData) {
    windowData.tabs.push(element); // Add the tab to the window's tabs
    console.log("kreiranje");
    chrome.runtime.sendMessage({ action: 'updateCount', count: counter });
  }
});

//removing tab
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (!removeInfo.isWindowClosing) {
    counter--; 
    chrome.windows.getCurrent(null, (currentWindow) => {
        const currentwindowData = data.find((window) => window.windowId === currentWindow.id);
        closedData.push(currentWindowData);
        //removing
        const tabIndex = currentwindowData.tabs.findIndex((tab) => tab.id === tabId);
        if (tabIndex !== -1) {
            currentwindowData.tabs.splice(tabIndex, 1); // Remove the tab from the window's tabs
            chrome.runtime.sendMessage({ action: 'updateCount', count: counter });
            
        }
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;

  // Find the window corresponding to the tab's windowId
  const windowData = data.find((window) => window.windowId === activeInfo.windowId);
  if (windowData) {
    const currentTab = windowData.tabs.find((tab) => tab.id === tabId);

    if (currentTab) {
      currentTab.numOfClicks++;
      currentTab.time = new Date().toString();
      sortTabsByTime();
      chrome.runtime.sendMessage({ action: 'updateTabList', tabList: windowData.tabs });
    }
  }
});
//tab update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // nadjem prozor
    const windowData = data.find((window) => window.windowId === tab.windowId);

    if (windowData) {
        //nadjem tab
      const updatedTab = windowData.tabs.find((t) => t.id === tabId);
      if (updatedTab) {
        updatedTab.title = tab.title;
        updatedTab.time = new Date().toString();
        updatedTab.url = tab.url;
        console.log("update");
        

        chrome.runtime.sendMessage({ action: 'updateTabList', tabList: windowData.tabs });
      }
    }
  }
});
//kreira se novi prozor
chrome.windows.onCreated.addListener(function(window) {
  const tabs = [];
  const element = {
    windowId: window.id,
    tabs: tabs
  };
  data.push(element);
});

//primanje zahtjeva
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getCount') {
    const count = getCount();
    sendResponse({ count: count });
  } 
   if (request.action === 'getTabList') {
    console.log(request.windowId);
    const windowId = request.windowId;
    console.log(data);
    const windowData = data.find((element) => element.windowId === windowId);
    if (windowData) {
      console.log("nasla");
      const tabs = windowData.tabs;
      sendResponse({ tabList: tabs });
    }
    console.log("nisam nasla");
  }
});

function getCount() {
  return counter; 
}

function sortTabsByTime() {
  // Sort tabs for each window
  for (const windowData of data) {
    windowData.tabs.sort((a, b) => {
      const timeA = new Date(a.time);
      const timeB = new Date(b.time);
      return timeA - timeB;
    });
    console.log(windowData.tabs);
  }
}
//zatvaranje taba

function closeNextTab() {
    console.log("closing");
 
    chrome.windows.getCurrent(null, (currentWindow) => {
      const windowData = data.find((window) => window.windowId === currentWindow.id);
      let tabToCloseIndex = 0;
      if (windowData && windowData.tabs.length > 0) {
        const tabToClose = windowData.tabs[tabToCloseIndex];
        if (tabToClose) {
          // Close the tab using Chrome's API
          chrome.tabs.remove(tabToClose.id);
  
          // Move to the next tab to close
         // tabToCloseIndex = (tabToCloseIndex + 1) % windowData.tabs.length;
        }
      }
    });
  }
  
  // Call closeNextTab every ten minutes (600,000 milliseconds)
  let interval=20000;
  /*setTimeout(() => {
    closeNextTab();
    setInterval(closeNextTab, interval);
  }, 40000);*/
  