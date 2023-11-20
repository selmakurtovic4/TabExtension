document.addEventListener('DOMContentLoaded', function () {
  //  const number = document.getElementsByTagName('h3')[0];
    const tabListContainer = document.getElementsByClassName('tabListContainer')[0]; 
    //const id = document.getElementsByTagName('h7')[0];
  
    chrome.runtime.sendMessage({ action: 'getCount' }, function (response) {
      const count = response.count;
      //number.textContent = `${count}`;
    });
  
  
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];
          const windowId = activeTab.windowId;
          // Now you can send the message with the correct windowId
          chrome.runtime.sendMessage({ action: 'getTabList', windowId: windowId }, function (response) {
           /* if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              id.textContent=chrome.runtime.lastError;
            } else {*/
              const tabList = response.tabList;
              updateList(tabList);
           // }
          });
        } else {
          console.error('No active tab found.');
        }
      });
      
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'updateCount') {
          const count = request.count;
        //  number.textContent = `${count}`;
        }
        if (request.action === 'updateTabList'){
          console.log("update list");
          const tabList = request.tabList;
          updateList(tabList);
                  
        }
        if (request.action === 'updateClosedList'){
            console.log("update closed list");
            const closedList = request.closedList;
            updateList(tabList);
                    
          }
      });

    function updateList(tabList, listContainer){
        listContainer.innerHTML = '';
    
        const list = document.createElement('ul');
  
        for (const tab of tabList) {
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.textContent = `${tab.title}`;
          link.href = tab.url;
          link.target = '_blank'; 
          listItem.appendChild(link);
          list.appendChild(listItem);
        }
  
        listContainer.appendChild(list);


    }

  });
  