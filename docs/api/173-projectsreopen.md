# projects.reopen

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-projects-reopen

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Projects](/docs/api/legacy-projects)
  * projects.reopen



# projects.reopen
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects.reopen

Reopens a project, changing its status to "active".

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`01548b10-4932-4a18-8a89-005ad09db2c8`




## Responses​

  * 204



**Response Headers**




#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects.reopen");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"01548b10-4932-4a18-8a89-005ad09db2c8\"\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body required

  * Example (from schema)
  * Example


    
    
    {
      "id": "01548b10-4932-4a18-8a89-005ad09db2c8"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
