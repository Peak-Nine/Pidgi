# projectLines.removeFromGroup

> Source: https://developer.focus.teamleader.eu/docs/api/project-lines-remove-from-group

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Project lines](/docs/api/project-lines)
  * projectLines.removeFromGroup



# projectLines.removeFromGroup
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projectLines.removeFromGroup

Remove a task or material from the group it is currently in.

## Request​

  * application/json



### Body**required**

**line_id** stringrequired

The ID of the task or material. May not be a group.

**Example:**`a14a464d-320a-49bb-b6ee-b510c7f4f66c`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projectLines.removeFromGroup");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"line_id\": \"a14a464d-320a-49bb-b6ee-b510c7f4f66c\"\n}", null, "application/json");  
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
      "line_id": "a14a464d-320a-49bb-b6ee-b510c7f4f66c"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
