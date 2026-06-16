# tasks.delete

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-tasks-delete

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Tasks](/docs/api/projects-v-2-tasks)
  * tasks.delete



# tasks.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/tasks.delete

Delete a task.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`ff19a113-50ba-4afc-9fff-2e5c5c5a5485`

**delete_strategy** stringrequired

**Possible values:** [`unlink_time_tracking`, `delete_time_tracking`]

**Example:**`unlink_time_tracking`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/tasks.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"ff19a113-50ba-4afc-9fff-2e5c5c5a5485\",\n  \"delete_strategy\": \"unlink_time_tracking\"\n}", null, "application/json");  
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
      "id": "ff19a113-50ba-4afc-9fff-2e5c5c5a5485",
      "delete_strategy": "unlink_time_tracking"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
