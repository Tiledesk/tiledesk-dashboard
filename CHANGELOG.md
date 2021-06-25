
# tiledesk-dashboard


### 2.1.70-beta.1.10
- Fixes the bug: the conversation detail page crashes not dismissing the loading spinner if any of the attribute values are null
- Fixes the bug: contact details page does not show all attributes if any of the attribute values are null

### 2.1.70-beta.1.9
- Adds support for images with text on the conversation detail page in the chat section
- Fixes the bug: in the conversation details page the chat section scroll to bottom even if there are no new messages
- Replaces the markdown pipe with the linkify pipe
- Adds the Html entities encode pipe
- Updated in pre enviroment the endpoints of "CHAT_BASE_URL" to the Chat-Ionic (Firebase env) latest versions (3.0.42-beta.1.7)

### 2.1.70-beta.1.8
- Updated in pre enviroment the endpoints of "CHAT_BASE_URL" to the Chat-Ionic (Firebase env) latest versions (3.0.42-beta.1.6)

### 2.1.70-beta.1.7
- Updated in pre enviroment the endpoints of "CHAT_BASE_URL" to the Chat-Ionic (Firebase env) latest versions (3.0.42-beta.1.5)

### 2.1.70-beta.1.6
- Updated in pre enviroment the endpoints of "CHAT_BASE_URL" to the Chat-Ionic (MQTT env) latest versions (3.0.42-beta.1.4)

### 2.1.70-beta.1.5 
- Sets in pre: the value of the key chatEngine to 'mqtt', the value of the key uploadEngine to 'native' and the value of the key pushEngine to 'none'


### 2.1.70-beta.1.4
- Fixes the bug: redirectTo: 'login' when the path is empty 
- Updated in pre enviroment the endpoints of "CHAT_BASE_URL" to the Chat-Ionic latest versions (3.0.42-beta.1.1)

### 2.1.70-beta.1.3
- Fixes the bug: after the auto-login, the e-mail of the user who has logged in is missing
- Fixes bug: when the user is redirected to the Unauthorized Access page when trying to access a project he doesn't belong to, the project id is missing in the url

### 2.1.70-beta.1.2
- Adds the 'Ticket id' in the right sidebar of the conversation detail
- Adds the Unauthorized Access page to which the user is redirected when try to access a project he do not belong to

### 2.1.70-beta.1.1
- Fixes the bug: Incorrect encoding of HTML entities in the chat section of conversation detail page

### 2.1.70-beta.1.0
- Updated in pre enviroment the endpoints of "CHAT_BASE_URL" and "testsiteBaseUrl" to the Chat-Ionic and Widget latest versions

### 2.1.69
- Updated CHANGELOG

### 2.1.68
- Sets in pre enviroments the value of the key remoteConfig to true

### 2.1.67
- Fixes the bug: profile photos are missing when the availability status is updated on the teammates page
- Fixes the bug: the ticket ID does not contain the project id and uuid without hyphens

### 2.1.66
- Fixes the bug: the endpoint for deleting 'native' images is not obtained from the current environment configuration
- Improves the method signOut 
- Fixes the bug: the trigger condition "department has bot" does not work in trigger edit
- Replaces in "app-routing" the path: ' ' redirectTo: 'projects' with the path: '', redirectTo: 'login
- Adds the custom pipes 'marked' and 'sanitizeHtml'

### 2.1.65
- Sets in config.json "firebaseAuth" to false

### 2.1.64
- Changes in pre enviroment the endpoint of the key "CHAT_BASE_URL" 

### 2.1.63
- Sets in pre environment the key "firebaseAuth" to false

### 2.1.62
- Minor improvements

### 2.1.61
- Adds in the chat section of the conversation detail page the text markdown and render the urls as clickable links
- Increase the "bubble" width in the chat section of the conversation detail page

### 2.1.60
- MQTT Environment fix

### 2.1.59
- MQTT Environment fix

### 2.1.58
- Changes environment's keys values  "widgetUrl" and "testsiteBaseUrl"

### 2.1.57
- Improves autologin and other minor improvements

### 2.1.56
- Improves autologin

### 2.1.55
- Adds the ability to upload (and get) the users and bot profile images to the firebase Storage or to the native Storage

### 2.1.54
- Improves in app.module the methods loadAppConfig() and loadBrand()
- Refactoring (in progress) of all app components that perform the 'get' of profiles images from Firebase by adding the "get" from native

### 2.1.53
- Adds the "upload-image-native" service
- Saves in local storage the token with the key "chat_sv5__tiledeskToken"
- Adds the "firebaseAuth" key in the environments and conditions signInWithCustomToken based on how it is valued (true or false)
- Adds the "uploadEngine" key in the environments and conditions the service to be used to upload and delete user and bot profile picture based on how it is valued (native or firebase)
- Adds the "pushEngine" key in the environments and conditions whether to use Firebase or another service to manage push notifications based on how it is valued (firebase or none)

### 2.1.52
- Minor improvements

### 2.1.51
- Fixes the bug: SSO login doesn't work if the 'chat engine' is mqtt

### 2.1.50
- Adds the "chatEngine" key in the environments and conditions the initialization of the configurations according to how it is valued (mqtt or firebase)

### 2.1.49.3
- Sets in pre enviroment the value of the key remoteConfig to true

### 2.1.49.2
- Fixes the bug 'type of undefined' on the trigger  "Offline Welcome Greeting"
- Adds the parameter 'appid' to the url that open the iframe in the 'app-store-install' component
- Adds the ability on the app store page to manage the installed app
- Adds the label 'Use this secret' in the modal window 'Shared secret webhook generated'

### 2.1.49.1
- Fixes the bug: requester_id of undefined
- Display "info" messages in the chat on the conversation detail page in the style they appear in the web chat
- Fixes the bug: accessing the dashboard in the conversations list page from the link suggested by the browser address bar, if the project is not found, the conversations are not found (now the user is redirected to the project list)
- Adds a loading spinner on the apps installation page
- Fixes the bug: when the trigger "When a visitor requests a chat" is created with the condition "Department" after saving the selected department is always the default department
- Fixes the bug: when the trigger "When a visitor requests a chat" is created with two conditions "Department" in the second condition the selected department is the same as the first one
- Fixes the bug: in the Analytics> Metrics> Satisfaction page the number of decimals displayed in the Average Satisfaction section is greater than two
- Fixes the bugs in Trigger related to the conditions: "Conversation status" and "The department has bot"
- Modifies path and key in the trigger 'Message create from requester'
- Fixes the bug: in the home page the link that directs to the 'Operating Hours' page is displayed even if the module is absent
- Fixes the bug: translation error in the page 'Widget' > Install widget with javascript code
- Adds "js.async = true" to the widget script
- Changes the translation of the tooltip on the map marker icon on the conversation list page (replaces "view assigned requests map" with "view on map") 
- Changes the method called by "Let's chat" which now allows to send an email to contatct the support team
- Replaces all the occurrences of "Let's chat" with "Contact us"
- Displays on the home page and on the conversation list page 'Operating Hours' as disabled even if they are activated but the paid plan has not been renewed or if the trial period has expired
- Bug fixed: on the "Choose bot type" page there is the possibility to create a Dialogflow bot even if the module "Dialogflow" is disabled

### 2.1.49
- Adds the "Trusted Info" accordion to the right sidebar of the contact details page
- Implements a new method to get if the contact is authenticated
- Fixes the bug: unassigned conversations map pin URL is incorrect

### 2.1.48
- Fixes the bug: on the conversation details page the "Trusted Info" accordion does not open if the attributes of the decoded jwt are undefined

### 2.1.47
- Fixes the bug: on the conversation details page the app crashes if the decoded jwt has null values

### 2.1.46
- Highlight, on the home page, the "What's new" section rocket with an icon indicating that the change log has been updated
- Update the "Latest Updates" section of the home page by highlighting some of the new features in version 2.1.46 of the dashboard

### 2.1.45
- Duplicate the "agent" array of the "request.snapshot" property in "request" during the "ON-UPDATE" websocket callback
- Replaces in the details page of the bot type "Diloagflow", "External" and "Resolution" the Bot Attributes section with the Department section that lists the departments the bot is associated with
- Adds links to documentation on the bot detail page for "Dialogflow", "External" and "Resolution" bot types
- Updates the Quick Tips section on the "Resolution bot" > "Add Answer" and "Edit Answer" pages
- Adds a link to documentation "Setting up automatic assignment" at the top of the Smart Assignment tab of the Project Settings page
- Removes the link to the "edit answer" page from the row in the Resolution Bot "Answers table"

### 2.1.44
- Rename the accordion "Jwt Decoded" to "Trusted Info" in the right sidebar of the conversation detail page and move it to the top of the sidebar
- Adds the attributes of the "decoded JWT" to the "Trusted Info" accordion
- Adds icons to accordions in the right sidebar of the conversation detail page
- Increase the size of the "verified contact" icon in the right sidebar of the conversation details when it is displayed in the chat
- Adds a check on the existence of the agents property in the "hasmeInAgents" method
- Truncates the project name in the navigation bar if it is too long
- Adds, in Project Settings > "Smart Assign" tab, the ability to enable / disable automatic assignment in the Auto Assignment section, moving it from Chat Limit

### 2.1.43
- Changes, in triggers, the ID and key of the "Number of available agents" condition
- Adds, on the conversation detail page, an accordion to display the properties of Attributes > decoded JWT 

### 2.1.42
- Adds, on the bot's details page, the possibility of associating the bot with a department to which no bot is associated
- Handles the "request.snapshot" property in "request" while duplicating the 'agent', 'lead' and 'requester' properties in the request object in case it doesn't have some or none of the properties

### 2.1.41
- Fixes bug: app crashes when real-time conversations, non-real-time conversations and history pages have old conversations
- Deletes, in the 'Routing & Depts' page, the logic relating to the activation of the 'bot only' option on a department
- Fixed bug: in the conversations page not in real time, resetting the filters does not show all the conversations if a filter on the type of conversation is active (i.e. assigned, not assigned)

### 2.1.40
- Improve deleting user profile photo and bot profile photo,
- Fixes the bug: in the 'Your requests' tab, in the 'conversations for department' section, the count of departments is relating to all conversations and not just those of the user currently logged
- Improves the contact details page
- Refactors the code by duplicating the 'agents' array and the 'department', 'lead' and 'requester' objects of the "request.snapshot" property in 'request' during the "ON-CREATE" websocket callback

### 2.1.39
- Replaces "plus" / "minus" buttons of notes and attributes with "angle up" / "angle down" on the conversation detail page
- Adds, on the bot detail page, the ability to delete the bot profile image
- Fixes bug: conditions are not displayed on the trigger editing page
- Fixes bug: conflict between uploading / deleting user image with uploading / deleting bot profile image
- Fixes bug: in the page add trigger when the page is refreshed the conditions are not displayed

### 2.1.38
- Replaces all occurrences of 'closed' with 'archived'
- Replaces all occurrences of 'Internal request' with 'Ticket'
- Adds a brief description of the identity bot in the right bar of the details of the "Identity" bot
- Adds, on the user profile page, the ability to delete the user profile image
- Refactors the code by taking agents, department, leads and requester from the "snapshot" property of the request object

### 2.1.37
- Fixes the bug: the "Create a free account" button does not appear on the login page
- Fixes the bug: in the details of the bot, section Departments this bot is associated with, the department is sometimes duplicated
- Adds, on the detail page of the bot type 'Resolution' > Answer details, the button Delete answer
- Fixes the example.csv file downloadable from the 'Import CSV file' modal window
- Fixes the bug: on the bot list page, the message count only works for Resolution type bots
- Adds, in the details of the bot type 'Resolution' > Answers table, the possibility to hide / display the Topic column

### 2.1.36
- Fixes bug of channels icons size in conversation detail
- Adds a badge that displays a tooltip on the unassigned conversations icon with the list of agents who have left the chat
- Adds, on the close button of the modal window "Add agent to a conversation" and "Reassign conversation", the effect on the mouse hover
- Adds, in the details of the bot Resolution > modal window Import CSV file, in the downloadable file "example.csv" the field intent_display_name
- Fixes the bug: In the details of "Resolution" bot type, when clicking the Delete Question button, the button redirects to the edit page
- Adds, in the conversation list, buttons that highlight the options enabled in Project Settings > Smart Assign
- Adds the ability, for administrators and owners, to manage Smart Assign for any type of project account
- Updates the "Latest Updates" section on the home page

### 2.1.35
- Bug fixes: the modal "reassign conversation" and the modal "add agent to the conversation" are not displayed correctly when the window width is less than 992px 
- Customize the size of modal windows "Add agent to a conversation" and "Reassign conversation" when viewed in the right sidebar of chat
- Adds, in modal windows "Add agent to a conversation" and "Reassign conversation", the avatars of the departments on which the is highlighted the status of the department (visible/not visible, active/ not active)
- Adds the check mark of the assignee in modal windows "Add agent to a conversation" and "Reassign conversation" when viewed in the right sidebar of chat

### 2.1.34
- Add the Events chart in Analytics > Metrics
- Refactors, on the creation page and on the update page of the triggers, user interface and conditions
- Adds, in Analytics > Metrics, the ability to filter the "Satisfaction" graph by agent

### 2.1.33
- Adds, for the "Resolution" bot type, the ability to handle webhook requests
- Improves the UI of bot details page and of the create / edit answer page
- Improves the UI of bot list page and of the create bot page

### 2.1.32
- Improves the shared component that contains links to documentation
- Adds, in the right sidebar of the bot detail page, the list of departments to which the bot is associated
- Adds, when creating a bot, the ability of activating the bot for a department
- Replaces, in the list of departments> "Bot" column, "no activated" with "no bot" when no bot is activated for the department
- Deletes, in the list of departments > "Bot" column, the text "activated" before the bot name when for the department is activated bot 
- Fixed bug: in the department details section> right sidebar> department agents section, the name and members of the "created on the fly" group are not displayed
- Adds "Understanding default roles" knowledge base link on teammate detail page and teammates list page

### 2.1.31
- Renames, in the conversation list page, create internal request in create ticket
- Filter, in the modal window Create Ticket > Requester drop-down menu, only the contacts that have the name
- Displays, in the modal window Create Ticket > Requester drop-down menu, the email and profile avatar of the requester
- Adds channel "form" in post request "Create ticket"
- Improves icons indicating the message channel
- Adds the icon indicating the form channel to the pages Conversations, Conversations not in real time, History and conversation details
- Adds an icon on the requester's avatar to the History, Real-time conversations list, and Non-Real-Time Conversations list pages that highlights if the requester is authenticated
- Adds, in the "Create New Requester" modal window, the validation of the form to create a new contact
- Adds, in the modal window 'Create ticket' > drop-down list 'Requester', the automatic selection of the new requester created
- Adds the 'Unauthorized Access' page displayed in case the user attempting to access the 'Pricing' page does not have the owner role
- Adds the ability only for users with the "owner" role to upgrade or downgrade the account plan

### 2.1.30
- Adds, in conversation detail, the ability of creating a ticket on Jira, when the app is distributed with the 'pre' environment configuration

### 2.1.29
- Fixes the bug: in the non-real-time conversations page, resetting the applied filters does not change the value selected in the "status" drop-down menu

### 2.1.28
- Improves and fixes the "Create Internal Request" and "Add New Requester" modal windows bugs
- Allows, in the conversations list> unassigned conversations section and in the non-real-time conversations page, to archive conversations only for users with owner or administrator role
- Adds the ability for assigned users of a conversation to open the chat directly from the list of non-real-time conversations
- Adds the user's role to the navigation bar's user profile drop-down menu
- Allows, in the list of non-real-time conversations, to archive unassigned conversations only to users with the role of owner or administrator
- Adds on the non-real-time conversations page, the ability to archive all conversations simultaneously if the user has an owner or administrator role
- Adds on the non-real-time conversations page, the ability to delete all conversations at once if the user has an owner role
- Adds the ability to filter conversations by tags on the non-real-time conversations page and history page
- Adds the total number of conversations and conversations found after applying a filter on the non-real-time conversations page and history page


### 2.1.27
- Adds, during the creation of an internal request, the possibility to select a bot, a teammate or a department as assignee

### 2.1.26
- Fixes the bug: on the conversations page, the 'You are about to join this chat ...' confirmation window doesn't handle the case when the conversation is assigned to a bot
- Fixes the bug: on the Recent Projects page, the icon indicating that the user is busy appears too low in the card if the project name goes on a second line
- Adds, when creating an internal request, the ability to select a requester and the ability to create a new one (in progress)
- Connect the dashboard, when is deployed with the configuration of the 'pre' environment, to the v5 version of the widget

### 2.1.25
- Adds, on the non-real-time conversations page, the ability to archive multiple conversations at the same time
- Fixes the bug: on the non-realtime conversations page, the applied filter is not displayed if the assigned conversations or the unassigned conversations are selected

### 2.1.24
- Renames the title of the page 'Add teammate' in 'Invite teammate'
- Adds icons to the conversations list and to conversation details to identify the channels from which messages are sent (whatsapp, telegram, messenger, email)
- Fixes the bug: in the history page the checkbox "select all" remains selected even if all the underlying checkboxes are not selected
- Fixes the bug: on the Analytics > Conversations page, the dropdown list is not aligned to the left
- Fixes the bug: in the detail page of the "Resolution" type bots, the count of how many times an answer is used is not always displayed
- Add tooltips and hover effect to icon buttons on the conversation history page
- Adds, on the conversation history page, the ability to perform a search by pressing the enter key on the keyboard

### 2.1.23
- Adds, in conversations list page, an "image skeleton spinner" to the project's teammates list and sorts teammates based on availability
- Adds, in the 'select bot type' page, in the card "Resolution bot" and in the card "Dialogflow bot" a link to the documentation
- Fixes the link to the tutorial for external chatbots integration
- Fixes the bug: in the bot list, in the type column, "internal" is displayed instead of "resolution"
- Changes, in the create bot page, the "Quick Tips" content text for the 'Resolution' type bots 
- Changes, in the create bot page, the "Quick Tips" content text for the 'Dialogflow' type bots 
- Fixes the link to the external script
- Displays a placeholder image on the bot detail page if the bot image is not found
- Improves the home page

### 2.1.22
- Improves the 'Widget Live Test' button on the widget settings page
- Fixes the bug: in the widget settings page, tooltips do not display the entire text
- Adds the list of the project teammates in the list of conversations with the indicators of availability and number of requests assigned
- Adds the ability to simultaneously select and delete multiple conversations in the history
- Adds in analytics a graph that represents the trend of customer satisfaction
- Adds a counter of the total next to the conversations graph,  visitors graph and messages graph
- Adds in Analytics > Conversations a graph that compares the conversations managed by humans and those managed by bots with also the possibility to select the different datasets
- Improves the layout of the analytics pages
- Adds, in the list of bots, the total number of messages sent by the bot
- Adds, in the bot details, the number of times a response has been used
- Adds in the conversation list page the ability to know served requests geolocation

### 2.1.21
- Fixes the bug: displays 'NaN' as percentage when the count of the conversations handled by bots is zero

### 2.1.20
- Adds in the home page the ability to know the count and the percentage of the conversations handled by bots
- Rename "native bot" to "resolution bot"

### 2.1.19
- Fixes bug: does not disable the "Create group" button (available in the "create group on the fly" sidebar) if the group name does not exist

### 2.1.18
- Adds a custom modal that prevents navigation if the changes have not been saved after modification or a creation of a department
- Displays an error message in the sidebar 'create group on the fly' if the group name already exists
- Improves the page of creation / editing of a department
- Improves the sidebar 'create group on the fly'

### 2.1.17
- Fixes: on the home page the statistics and the other insights on the current project do not change when the user change project from the navbar combobox
- Fixes: project id is in some cases undefined when the "checkRoleForCurrentProject" method is called
- Fixes: pages with limited access to the users with administrator or owner roles can also be visited by users with agent role
- Fixes department visibility status update service

### 2.1.16
- Makes the "Smart assign" tab visible in project settings

### 2.1.15
- Minor improvements
- Rename in the project settings the tab 'Advanced' in "Smart assign"
- Set "sharing the team's average response time" to true by default
- Adds in the home page the section latest updates
- Adds the navigation item "what's new" in the header of the home page through which is possible to access to the CHANGELOG

### 2.1.14
- Minor improvements

### 2.1.13
- Fixes the pre environoment

### 2.1.12
- Adds in polifills.ts an inport for the support of Object.entries in IE11
- Adds in the conversations list page the ability to open the chats
- Adds an alert on the conversation list page that trigger on click to 'join chat' button to notify the user if they are sure they want to join the conversation already served by others

### 2.1.11
- Minor improvements

### 2.1.10
- Fixes the endpoint of the configuration property 'testsiteBaseUrl'

### 2.1.9
- Changes the endpoint of the configuration properties 'widgetUrl' and 'testsiteBaseUrl'

### 2.1.8
- Manages the signup form validation error when the user try to signup but not all fields are filled in 
- Changes all occurrences of 'Labels' to 'Tags'
- Runs the subscription to the websocket for the project user availability only for the active projects
- Improves the display of "the user is busy" in the sidebar
- Adds a spinner to the "project" cards in the project list and improves the loading time of the selected project
- Disables in widget settings page, section "Reply time" the option not selected
- Adds an ends space, if it does not exist, to the translation label "WAITING_TIME_FOUND" to prevent the placeholder "$reply_time" from being merged with the string
- Fixes bug: changing the availability status in the user list does not update the status in the sidebar and vice versa

### 2.1.5
- Changes all occurrences of 'served conversations' to 'assigned conversations' and of 'unserved conversations' to 'unassigned conversations' and of 'Served by' in 'Assigned to'
- Changes the display order of the 'Last 30 days ...' statistics on the home page
- Changes all occurrences of 'teammates seats' in 'seats'
- Changes the "icon only" "Simulate Visitor" button in the navigation bar to one that displays its text
- Fixes graphical errors in the home and resize the graph
- Creates two sections in the 'Routing & Departments' page to separate the Default routing from the list of departments
- Improves widget preview: vertically centered the icon 'settings' 
- Adds quick tips in the "Routing Rules" section of the edit department page
- Fixes subscription to the availability of the current user (adds publication of the status in the websocket's callback 'update')
- Manages the links of the 'Last 30 days ...' statistics available in the home to the reports in analytics when the plan has expired or the trial period has expired
- Replaces in the department list the visibility checkbox with a toggle switch button and adds a badge over the department avatar to indicate the status visible / not visible
- Adds the ability to create a group on the fly when creating or editing a department and automatically selects the new group created
- Change the occurrence of the project-user's property max_served_chat to max_assigned_chat
- Change the occurrence of the project's property max_agent_served_chat to max_agent_assigned_chat
- Fix the display of double in-app notifications displayed when saving settings on the widget settings page and other minor bugs

### 2.1.4
- Adds the ability in 'Routing and Depts' to create a new group 'on the fly'
- Adds a link in "Routing and Depts" next to the name of the group assigned to the department that directs to the group editing page

### 2.1.3
- Merges Routing and Departments in a single menu item
- Fixes the default language is lost when its labels are updated (in widget set up page and in multilanguage page)
- Adds in widget set up page an alert when translations are present but no default language is set
- Replaces in the method 'close' of the websocket this.callbacks = [] with this.callbacks = {} (for test of the error callbackSet is not a function)
- Minor bug fixing

### 2.1.2
- Adds in conversation details the ability to open/close attributes details
- Fixes the length of the text displayed in the right sidebar of conversation details for the 'source page' and for 'conversation id'
- Manages the 'take a shortcut' section present in the home header in the case that the temmate role is agent and in the case that the 'App-store' is not enabled
- Adds the "Notifications" tab in the Project Settings that adds the ability to enable/disable the receipt of emails for both the conversations assigned to the current user and for the unassigned conversations.
- Moves the feature 'Webhooks management' from sidebar to Project Settings > Developer
- Moves the feature 'Auto send transcript by email' from Project Settings > General to Project Settings > Developer
- Fixes the display of the contact's full name when absent in the tooltip 'chat with' of the Contacts page
- Adds the ability to go to the contact profile by clicking the contact's avatar available in conversation details
- Merges Departments with Routing (in progress)

### 2.1.1
- Replaces in teammates list profile image placeholder with avatar generated by teammate initials
- Fixes the "requester's presence"
- Fixes websocket unsubscriptions on project change
- Adds a step to the create project wizard with the abilities of customize the widget and to select the project's default language
- Changes widget set up page graphics and adds the ability to manage the reply time, the pre chat form and more
- Changes the home page graphics and adds the ability to know some basic settings and statistics of the project
- Replaces the occurrences of "users" and "operators" with "teammates"
- Adds in conversation details the ability to see the images sent by the requester

### 2.1.0
- Adds the ability to integrate Webhooks 
- Adds in Analytics > Metrics the graphs Visitors and Messages
- Adds in teammate profile the ability to disable / enable to receive emails when the conversation is assigned to the logged in user
- Adds in current logged teammate profile the ability to disable / enable to receive emails when a conversation is assigned
- Adds in current logged teammate profile the ability to disable / enable to receive emails when a conversation is unassigned

### 2.0.83
- Add the property "appId" in dashboard-config-template

### 2.0.82 (tagged version)
- Updated dashboard-config.json
- Updated Firebase dependency to 7.24.0

### 2.0.81
- fixes excessive loading time when refreshing the conversation list

### 2.0.80
- Fixes production environment settings

### 2.0.79
- New widget settings page (in progress)
- Fixes block in loading conversation details

### 2.0.78
- Fixes the departments status updating service

### 2.0.77
- Adds query string with the fields "project_id" and "jwt" of to the app store apps installation url

### 2.0.76
- Adds events and visitors (test)

### 2.0.75
- Displays in the conversation list a badge over the link to the not real-time conversations if the total count of conversation is >=100

### 2.0.74
- Change the color of the border highlighting that it is the registered user serving the conversation
- Changes the bot avatar in the bot test page 
- Fixes the display of the 'verified contact' icon on the 'not real-time' conversations page
- Adds in the 'not real-time' conversation page the evidence of the filter applied
- Improves in the 'not real-time' conversation page and in the history page the filters box and adds the evidence of the applied filters
- Moves in the top bar of the conversations page the link to the 'not real-time' conversations
- Displays a custom loading when the conversation detail page "for the chat" is running on mobile devices

### 2.0.73 
- Fixes the message displayed when occurs an error sending the password recovery email
- Updates the preview of the callout in the callout customization page
- Adds in the callout customization page the ability to enable the callout with a "toggle switch"
- Adds in the callout customization page the ability to customize the emoticon
- Adds in Triggers list page the tabs to filter the triggers for type custom / system 
- Adds in Triggers list page a link to the trigger documentation 
- Removes in Triggers list page the ability to delete triggers of "system type"
- Adds in the request details visible in the chat the ability to open the chat transcript
- Removes in the request details visible in the chat the button 'go to request'
- Adds in the widget customization page the notes on the properties that the image of custom logo must have
- Fixes in the app service the call to get the apps

### 2.0.72 
- Adds the ability in conversations list to filter for "Human Agents only" and for "Bots Only"

### 2.0.71
- Displays the in-app notifications only once
- Renames occurrences of 'requests' to 'conversations'
- Gets contacts presence from websocket subscription (no longer from firebase)
- Fixes widget logo
- Adds on the navigation bar a link to the simulate visitor page 
- Adds on the navigation bar the ability to know if the operating hours are enabled 
- Fixes the loading spinner display in app-store page


### 2.0.68
- Displays in requests list name initials if profile picture is not provided

### 2.0.67
- Updates the Dockerfile with the commands to bundle the dashboard for production 

### 2.0.64
- Adds a navigable sidebar (projects, unserved requests, request details) that will be integrated in the chat

### 2.0.63
- Adds in README the explanation on how to load external script 

### 2.0.62
- Improves scripts service

### 2.0.61
- Adds the ability to load external scripts

### 2.0.60
- Fixes brand service

### 2.0.59
- Does not allow to delete a bot if it is associated with a department

### 2.0.58
- Adds the ability to customize the brand from an external json

### 2.0.57
- Adds the ability to join a request from the requests list
- Changes in the request list the orientation of agent avatars to horizontal on desktop devices
- Improves UI

### 2.0.56
- Adds links in "Create a dialogflow bot" page to related Knowledge Base 

### 2.0.55
- Fixes the logout button visibility on small device
- Adds links in edit / add FAQs pages to related Knowledge Base 
- Adds widget pre-translated languages: German, Portuguese, Russian, Spanish, Turkish
- Disabled the ability to agents to archive a request of which they aren't "participants"

### 2.0.54
- Adds SSO service

### 2.0.53
- Fixes the external docs urls 

### 2.0.46
- Disables the ability to owner and to current user to delete themselves from the project

### 2.0.45
- Fixes the scroll in the modal window add agent to a request / assign request

### 2.0.44
- Disables the ability to agent to add another agent to a request, to reassign a request and to close a request of which he not is a participant
- Makes the surname field mandatory during registration
- Fixes the layout on mobile of the list of the requests

### 2.0.43
- Minor improvements

### 2.0.42
- Adds the lazy loading of agents and bots in the request list

### 2.0.41
- Minor improvements

### 2.0.40
- Changes the endpoint of the "bot credential" service

### 2.0.39
- Changes the id and the condition of the trigger "available agents"

### 2.0.38
- Adds the lazy loading of departments in the request list

### 2.0.37
- Minor improvements

### 2.0.36
- Minor improvements and bug fixing

### 2.0.31
- Adds the ability to reset the prebuilt triggers
- Adds the ability to edit the "Offices are closed" widget message

### 2.0.26
- Adds the ability to add or edit a description for bots
- Improves departments list page, department create and edit page and the routing page

### 2.0.23
- Adds the labels in requests list and history

### 2.0.16
- Adds to history and request's details custom icons for browser and operating system data retrieved from the "User-agent"
- Adds the ability to add or edit a description for departments

### 2.0.14
- Adds to requests list custom icons for browser and operating system data retrieved from the "User-agent"

### 2.0.12
- Fixes bugs
- Redirects to the recent projects page if the user is logged in and is directed to the login or registration page
- Adds a spinner in the popup window "create bot"

### 2.0.8
- Adds mimor improvements
- Merges pull request 'German language support'. Many thanks Michael

### 2.0.4
- Adds the ability to remove the account

### 2.0.1
- Fixes in 'Labels' the labels color dropdown is always open at media width < 992px
- Allows agents to edit notes and labels only of their own requests
- Allows agents to edit notes and labels only of their own requests
- Adds in the users list the evidence of the "busy user" status if an agent reach the limit of maximum chats

### 2.0.0
- Adds widget trigger
- Adds filters for agent and department in the requests' list page
- Displays the request's attributes in the request details page
- Fixes the upload of the user profile image when one already exist
- Adds the ability to upload bot profile image
- Fixes the bottom nav in metrics page
- Adds the ability to customize all over the app the properties concerning the company (company name, the logo images, company site and contact email and more)
- Changes the environments' publicKey
- Adds the ability to customize buttons' color
- Adds the ability to translate or edit all the phrases appearing in the widget
- Adds the ability to reassign a request to a department
- Adds the ability to reassign a request to a bot
- Adds the ability to view all the request' attributes
- Adds the ability to view all the contact' attributes
- Fixes the in-app notifications and count of unserved requests when user' role is agent 
- Fixes the reload of the request's details page when change the request id url parameter
- Fixes the handle-invitation path without surname parameter 
- Fixes registration form' email validation to not allow address without domain
- Edits endpoints services for users and project users
- Fixes "project settings" sidebar menu item is not displayed
- Fixes the error that generates the logout if made in the request' details page
- Adds the ability to create an "internal request"
- Adds the ability to chat with an agent of a request
- Adds the ability to integrate a Dialogflow bot
- Adds the ability to create canned responses
- Adds the ability to add label to requests
- Adds the ability to limit the number of concurrent chats each agent can take at once
- Adds the ability to reassign chat after a specified time frame
- Adds the ability to set an agent's status to unavailable after a consecutive number of chats reassigned
- Adds real time update of the current user availability
- Fixes the delete of a project
- Adds the ability to turn off the in-app notifications sound
- Adds in the sidebar the evidence of the "busy user" status if the current user reach the limit of maximum chats
- Adds attributes to contacts (company, note, address, phone)

### 1.0.40
- Fixes the user profile urls

### 1.0.39
- Minor improvements

### 1.0.38
- Changes the url of the widget live test page
- Adds in the sidebar the link to "Tiledesk changelog" blog


### 1.0.37
- Improves the project settings page organizing the contents in tabs and adding info
- Adds a "SAVE" buttons on top of the widget settings pages 
- Fixes the issue of saving the widget setting
- Improves the widget live test page

### 1.0.36
- Adds a two step wizard (create project and install widget) after the sign up
- Adds the list of recent projects in the navbar "project" dropdown menu 
- Adds save button to widget settings
- Improves graphics of the widget settings pages
- Adds help page to improve new users pending invitations workflow
- Fixes minor bugs

### 1.0.35
- Fixes minor bugs

### 1.0.34
- Adds Pricing

### 1.0.33
- Fixes minor bugs

### 1.0.32
- Implements the new FAQ services

### 1.0.31
- Adds in Analytics the graphs: "Requests per hour of day", "Median Response Time", "Median Conversation Lenght"
- Adds in Analytics' graph "Number of requests last 7 days" the ability to filter by time range and project's departments

### 1.0.30
- Minor improvements

### 1.0.29
- Fixes the widget url

### 1.0.28
- Adds the chat widget
- Adds the ability to revoke a pending invitation

### 1.0.26
- Adds the "Train bot" slide-out panel in request's details and in the bot test page
- Fixes the link in the home page "Get The Mobile App"

### 1.0.24
- Improves the chat in the request's detail page

### 1.0.23
- Fixes minor bugs

### 1.0.22
- Adds the ability to view the request details by clicking on the in app notifications
- Adds the button "delete contact" in the contact details page
- Groups: fixes the count of members of groups
- Project settings: adds a link to 'Widget Authentication'
- Bots: adds the ability to manage external bot
- Fixes the login and logout errors caused by the Firebase Cloud Messaging
- Adds Activities log

### 1.0.20
- Adds the avatar of the agents in the column 'Served By' of the history table
- Adds graphic improvements
- Fixes minor bugs

### 1.0.19
- Outsources the url of the widget; updates the names of the 'base-urls' in the 'environments' files

### 1.0.18
- Minor improvements

### 1.0.16
- Remove 'AngularFire2' dependencies and update 'Firebase'
- Adds the ability to allow to receive Web Push Notifications for the requests in which the current user is an agent
- Adds the avatar of the agents in the column 'Served By' of the support requests list

### 1.0.15
- Disable autocapitalize of the the inputs of type email

### 1.0.14
- Adds the requester avatar in the history page
- Adds the available / unavailable agent status in the pop-up windows "reassign request" and "add agent"

### 1.0.12
- Adds the notifications for the requests assigned to the logged agent
- Adds in the footer the the ability to send an email to info@tiledesk.com
- Adds in history the requester name

### 1.0.11
- Replaces the comma with the semicolon as column delimiter of the exported faq.csv file
- Adds in the pop-up window 'Upload CSV' the ability to download the example.csv file 

### 1.0.10
- Adds the titles on the login page and on the signup page

### 1.0.9
- Bug fixed: requests assigned to a department and then reassigned to an agent of another department are not listed among the new agent's requests
- Edits: the unserved requests notifications are not displayed if it are older than one day
- Adds the display of notifications when the user change the widget appearance or the department online / offline messages
- Adds to the sidebar's avatar a link to the user' profile
- Adds to the sidebar the menu item 'Project Settings'
- Adds tabs to switch from the user-profile page to the change password page 
- Other minor improvements

### 1.0.8
- Adds translations for the Notification Messages related to user actions

### 1.0.7
- Adds the ability to resend the invitation email

### 1.0.6
- Displays an alert to encourage the user to open the chat

### 1.0.5
- Fixes some translations

### 1.0.4
- Sorts the dates in ascending order in the graph "Number of requests last 7 days" 

### 1.0.3
- Adds to the user with role Agent the ability to reassign a request
- Adds to the user with role Agent the ability to add an agent to serve a request
- Removes to the user with role Agent the ability to delete a contact

### 1.0.2
- Analytics, count of last 7 days requests: fixed the bug "month label and count of requests are undefined if the month is represented with one digit"

### 1.0.1
- Adds widget appearance preview
- Adds the ability to change the widget logo
- Adds the ability to customize the widget welcome messages
- Adds the ability to customize the online / offline messages

### 1.0.0
- Adds a tooltip to the column "visibility" of the departments list 

### 0.9.51
- Adds the ability of set a department as hidden so that it is not displayed in the list of widget's available departments

### 0.9.50
- Avatars of the contacts : adequate colors and initials to those of the widget
- Users list: translated the roles

### 0.9.49
- Adds "Export faqs to CSV"
- Adds "Export contacts to CSV"
- Adds "Export requests history to CSV"
- Adds search for contacts by email
- Adds in the request's details 'View contact's details'

### 0.9.48
- Adds requester online/offline status