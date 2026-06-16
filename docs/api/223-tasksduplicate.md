# tasks.duplicate

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-tasks-duplicate

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Tasks](/docs/api/projects-v-2-tasks)
  * tasks.duplicate



# tasks.duplicate
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/tasks.duplicate

Duplicate a task, without its time trackings.

## Request​

  * application/json



### Body**required**

**origin_id** stringrequired

The id of the task that is being duplicated

**Example:**`0186a6b5-32d9-73d4-a416-d9f86cba567d`




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "nextgenTask",  
        "id": "0186a721-3879-729a-bf52-91576e0522f3"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "nextgenTask",  
        "id": "0186a721-3879-729a-bf52-91576e0522f3"  
      }  
    }  
    

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/tasks.duplicate");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"origin_id\": \"0186a6b5-32d9-73d4-a416-d9f86cba567d\"\n}", null, "application/json");  
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
      "origin_id": "0186a6b5-32d9-73d4-a416-d9f86cba567d"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
