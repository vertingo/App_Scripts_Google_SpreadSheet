![Image](https://raw.githubusercontent.com/vertingo/Easy_Admin_YouTube_Newsletter_Firebase/master/web/assets/images/github/vertin_go_website.jpg)
### ?? Apporter votre soutien au projet :heart: pour de futures évolutions!
[![GitHub stars](https://img.shields.io/github/stars/vertingo/screenshott.svg?style=social&label=Star)](https://github.com/vertingo/App_Scripts_Google_SpreadSheet) [![GitHub forks](https://img.shields.io/github/forks/vertingo/screenshott.svg?style=social&label=Fork)](https://github.com/vertingo/App_Scripts_Google_SpreadSheet/fork) [![GitHub watchers](https://img.shields.io/github/watchers/vertingo/screenshott.svg?style=social&label=Watch)](https://github.com/vertingo/App_Scripts_Google_SpreadSheet) [![GitHub followers](https://img.shields.io/github/followers/vertingo.svg?style=social&label=Follow)](https://github.com/vertingo)
[![Twitter Follow](https://img.shields.io/twitter/follow/Vertin_Go.svg?style=social)](https://twitter.com/Vertin_Go)

# Apps Script Code Snippets

The `youtube-data-api.gs` file in this directory contains code snippets that are generated
by the Data API code snippet tool at:
https://developers.google.com/youtube/v3/code_samples/code_snippets

You can use that tool to test different parameter values and to generate code samples with
those modified parameter values. The tool generates code for several other programming
languages as well.

Each function in the file demonstrates a particular use case for a particular API method.
For example, there are several different use cases for calling the `search.list()` method,
such as searching by keyword or searching for live events.

In addition to the use-case-specific functions, the file also contains some boilerplate code
that prints some data from an API response to the logging console. The print function is
currently designed just to show that each API response returns data and serves as a placeholder
for any function that would actually process an API response.

## Running these samples

To run these samples:

1. Create a spreadsheet in [Google Drive](https://spreadsheets.google.com).
2. Select **Tools &gt; Script Editor** from the menu bar.
3. Paste this code into the script editor and save your file.
4. In the script, select **Resources &gt; Advanced Google Services** and toggle the option for the
   YouTube Data API to on.
5. Click the link to the Google Developers Console and enable the YouTube Data API for the project.
6. Go back to the script editor and click 'OK' to indicate that you have finished enabling advanced services.
7. Run the `Main` function in your script.
8. Select **View &gt; Logs** to see the output from the script.


## Clasp CLI Tools

Command to install via Node.JS:

```
npm i @google/clasp -g
```

Login with your credentials:

```
clasp login
```

Create your first App Scripts project:

```
mkdir clasp_codelab;
cd clasp_codelab;
clasp create "Clasp Codelab";
```
Clone a project from Google SpreadSheet(https://spreadsheets.google.com)
You can fin your scriptID by going to File > Project properties > Info > Script ID

```
clasp clone <scriptID>
```

Open the script in the cloud :

```
clasp open
```

In the Editor create a new file:
File > New > Script file 
Enter the name for your file and add the following code:


```
var world = "world";

function hello() {
  Logger.log("Hello, " + world);
}

```

Be sure to save all files. Try running the function by pressing Run > Run function > hello.
Go to View > Logs to see the greeting.

By now you may notice that our code is now out of sync with the online editor!
To fix that, let's pull the code from our online project

```
clasp pull
```

And to make the inverse when your work locally and update your code with your repository online:
```
clasp push
```

clasp allows you to manage versions and deployments. First, some vocabulary:

Version: A "snapshot" of a script project. A version can be considered a read-only branch used for deployments.
Deployment: A published release of a script project (often as an add-on or web app). Requires a version number.

Let's create a version of our script:

```
clasp version "First version"
```

Using the logged version string we created in place of [version], we can deploy the script:

```
clasp deploy 1 "First deployment"
```
The clasp deploy command looks at your manifest and creates a new versioned deployment. 
Your code is now deployed as an executable. Learn more about this in the deployments guide.


<p align="center">
  <a href="https://www.youtube.com/channel/UC2g_-ipVjit6ZlACPWG4JvA?sub_confirmation=1"><img src="https://platform-media.herokuapp.com/assets/images/reseaux-sociaux/youtube2.png" width="400" height="250"/></a>
  <a href="https://www.facebook.com/vertingo/"><img src="https://platform-media.herokuapp.com/assets/images/reseaux-sociaux/rejoins_nous.png" width="400" height="250"/></a>
</p>