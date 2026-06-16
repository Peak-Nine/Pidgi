# tasks.delete

> Source: https://developer.focus.teamleader.eu/docs/api/tasks-delete

  * [](/)
  * [API Reference](/docs/api)
  * Tasks
  * [Tasks](/docs/api/tasks)
  * tasks.delete



# tasks.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tasks.delete

Delete a task.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`5f0afd8a-8a40-48a4-bbe6-7d0e9c61bb6d`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tasks.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"5f0afd8a-8a40-48a4-bbe6-7d0e9c61bb6d\"\n}", null, "application/json");  
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
      "id": "5f0afd8a-8a40-48a4-bbe6-7d0e9c61bb6d"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
