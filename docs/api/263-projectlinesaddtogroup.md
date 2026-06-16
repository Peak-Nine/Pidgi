# projectLines.addToGroup

> Source: https://developer.focus.teamleader.eu/docs/api/project-lines-add-to-group

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Project lines](/docs/api/project-lines)
  * projectLines.addToGroup



# projectLines.addToGroup
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projectLines.addToGroup

Add an existing task or material to a group.

## Request​

  * application/json



### Body**required**

**line_id** stringrequired

The ID of the task or material. May not be a group.

**Example:**`a14a464d-320a-49bb-b6ee-b510c7f4f66c`

**group_id** stringrequired

**Example:**`0daf76e6-5141-4fb0-866f-01916a873a38`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projectLines.addToGroup");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"line_id\": \"a14a464d-320a-49bb-b6ee-b510c7f4f66c\",\n  \"group_id\": \"0daf76e6-5141-4fb0-866f-01916a873a38\"\n}", null, "application/json");  
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
      "line_id": "a14a464d-320a-49bb-b6ee-b510c7f4f66c",
      "group_id": "0daf76e6-5141-4fb0-866f-01916a873a38"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
