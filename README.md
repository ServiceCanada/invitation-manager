# invitation-manager
Independent version of GCWEB for invitation to a survey through a popup window.

# What is the GC Invitation Manager?
The GC Invitation Manager is a software that can be installed on any of Government of Canada Web server(s) and is designed to trigger and manage invitation popups across your GC web site.
The GC Invitation Popup is a customizable popup window that will appear on designated pages within your GC web site prompting the visitor to complete a survey study.
![image](https://user-images.githubusercontent.com/65025061/93470396-da1d0b80-f8bf-11ea-816b-d3c68442f535.png)

An invitation popup will always contain the following information:
1.	The title of the website survey study you wish for visitors to participate in
2.	A small description of the survey study
3.	A clickable “Yes” button for visitors accepting to participate in the survey study
4.	A clickable “No” button for visitors declining to participate in the survey study

# How to Download and Install the Invitation Manager?
[Download the invitation manager Zip file](https://servicecanada.github.io/invitation-manager/invitation-manager.zip) and save it to your local drive.
Click to open the .zip file or use any tool to un-zip the file and save contents to your local drive.  Within the ZIP file you will find the following:
* "invitation-manager" folder:
	* InvitationManager.js
	* Overlay.js
	* Overlay.css
	* config.json
	* im.json

# Installing the GC Invitation Manager

## Preparing to install
Copy the “invitation-manager” folder and its content (InvitationManager.js, Overlay.js, Overlay.css, config.JSON, and im.json) to your web server. This step may require access to an ftp server. If you do not have access, please get in touch with your development/IT team.
Note that if your server is not using jQuery library version 2.2.4 or higher you will need to update this. 

## Installation setup
1.	Decide where you want to save the im.json file. Consider easy access for whomever will be creating/editing/removing the pop-ups. If you would like for it to remain in the invitation-manager folder, no action is required. Otherwise, move the file now.
2.	Open the “config.json” file in the “invitation-manager” folder and locate the dbURL parameter. This value allows the “config.json” file to reference the “im.json” file and can be updated when a new “im.json” file is created or moved. For the initial installation, the value should equal the path of the “im.json” file.
  * Example: “/invitation-manager/im.json”.
3.	Open the “im.json” file. This file is the data source of the Invitation Manager tool and will need to be updated with your departmental data and customized for your web server.
Update the following parameters:
*	**“duration-delay”** value contains the minimal number of days a visitor will see their next popup invitation when visiting your site(s). You can put any number greater than zero.
    *	For example, put 15 for fifteen days.
*	**“page-probability”** value contains the rolling probability a visitor will see page level popup invitations.
    *	For example, put 0.7 for 70%.
*	**“site-probability”** value contains the rolling probability a visitor will see a site level popup invitations.
    *	For example, put 0.3 for 30%.
Notice that the sum of page-probability and site-probability is equal to 1
*	**“blacklist”** value contains an array of URLs that represent the blacklist. They are the URLS you exclude from receiving the invitation popup.
*	**“whitelist”** value contains an array of URLs that represent the whitelist. A list of server domains and/or URLS that you want the popup invitation to execute.

## Creating a Popup
In order for the Invitation Manager to be functional, you will have to refer to the next sections “How to Configure the JSON File that contains all Invitation Manager Surveys?” and "How the Invitation Manager Work?".
## Updating the HTML of your web page(s)
Each page on your website must be updated with the following html links in order to reference the invitation manager files.
1.	Add an html link to the “Overlay.css” file to the head of your web page
    * Example: 
        * link rel="stylesheet" href="/invitation-manager/Overlay.css" 
  
2.	Add html links to the “Overlay.js”, and “InvitationManager.js” files before the closing body of your web page.
    * Example:
        * <script src="/invitation-manager/Overlay.js"></script>
        * <script src="/invitation-manager/InvitationManager.js"></script>

# How to Configure the JSON File that contains all Your Invitation Manager Surveys?
By opening the im.json file you will be able to add, update, or delete an invite in your server.

## Adding an Invite
To create a new invite, add an item to the “surveys” array in the im.json file that contains the following data parameters:
*	 **“id”** value contains the id of the survey (example “4”).
*	**“title-en”** value contains the title in English for the popup invitation.
*	**“title-fr”** value contains the title in French for the popup invitation.
*	**“body-en”** value contains the formatted html for the English content: body of the popup invitation.
*	**“body-fr”** value contains the formatted html for the French content: body of the popup invitation.
*	**“link-en”** value contains the link to the survey in English when the user selects the yes button.
*	**“link-fr”** value contains the link to the survey in French when the user selects the yes button.
*	**“start-on”** value contains the start date of the popup invitation.
*	**“end-on”** value contains the end date of the popup invitation.
*	**“type”** value contains the scope of the survey: “Entire site” if the popup invitation is site scoped and “Page” if the popup invitation is page scoped.
*	**“probability”** value contains the probability of a visitor viewing the popup invitation in its scope. That means that the sum of all popup invitations of the same scope cannot exceed 1.
*	**“yes-en”** value contains the formatted html for the English content: yes button of the popup invitation.
*	**“yes-fr”** value contains the formatted html for the French content: yes button of the popup invitation
*	**“no-en”** value contains the formatted html for the English content: no button of the popup invitation
*	**“no-fr”** value contains the formatted html for the French content: no button of the popup invitation.
*	**“close-en”** value contains the English text of the close icon or escape key.
*	**“close-fr”** value contains the French text of the close icon or escape key.
*	**“name”** value contains the survey name.
*	**“survey-urls”** value contains either an array of “site” URLs if the survey scope is site, or an array of “url” URLs if the survey scope is page.

## Update an invite
You can update any data excluding the “id” field of the corresponding item in the “surveys” array of the im.json file.

## Remove an invite
To remove an invite permanently from your server, you have just to delete the corresponding item in the “surveys” array of the im.json file.
Notice that you can manage the survey activity by just modifying the “start-on” and “end-on” date values.

# How does the Invitation Manager work?
Once properly installed on your web server, the GC Invitation Manager script will run in the background of your GC web site, and is triggered once a visitor enters the GC website. Upon entry, the visitor is assessed against specific criteria to determine whether the visitor qualifies for a popup invitation.
The GC Invitation Manager criteria are based on executable steps. If at any of these steps a visitor is not qualified, the remainder of the steps will not execute and the visitor will automatically not qualify for an invitation popup:

* **Step 1**: JavaScript is enabled on the visitor’s web browser and cookies are allowed.
* **Step 2**: The Visitor has not seen an invitation popup during the set designated period within the “duration-delay” parameter. (Example: the last 15 days)
* **Step 3**: A random number is generated for the user to assign the scope (Page level or Site wide level) to display.
* **Step 4**: Does the specific web page visited qualify for any active survey studies based on date the web page was viewed? (“start-on” and “end-on” parameters)
* **Step 5**: Is the visited page included in the Whitelist of GC pages and not included in the Blacklist of GC pages?
* **Step 6**: The probability of the GC page/site invitation popups are calculated.
* **Step 7**: A random number is generated to qualify the visitor for the invitation popup in relation to the calculated probability.
* **Step 8**: Display invitation popup.

If the visitor qualifies, an invitation popup will appear in the browser prompting the visitor to accept or decline participating in the survey. Additionally, a time stamp is recorded within local storage to identify that the visitor has seen a popup.
If the visitor does not qualify he will receive no invitation popup from the invitation manager.




