# tasks.schedule

> Source: https://developer.focus.teamleader.eu/docs/api/tasks-schedule

  * [](/)
  * [API Reference](/docs/api)
  * Tasks
  * [Tasks](/docs/api/tasks)
  * tasks.schedule



# tasks.schedule
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tasks.schedule

Schedule a task in your calendar.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`7c70c54e-6e50-4e6a-b5fd-80234eb535cf`

**starts_at** stringrequired

**Example:**`2016-02-04T16:00:00+00:00`

**ends_at** stringrequired

**Example:**`2016-02-04T18:00:00+00:00`




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
        "type": "event",  
        "id": "d7d2d100-d440-46c2-a4a3-177ad4b2a860"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "event",  
        "id": "d7d2d100-d440-46c2-a4a3-177ad4b2a860"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tasks.schedule");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"7c70c54e-6e50-4e6a-b5fd-80234eb535cf\",\n  \"starts_at\": \"2016-02-04T16:00:00+00:00\",\n  \"ends_at\": \"2016-02-04T18:00:00+00:00\"\n}", null, "application/json");  
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
      "id": "7c70c54e-6e50-4e6a-b5fd-80234eb535cf",
      "starts_at": "2016-02-04T16:00:00+00:00",
      "ends_at": "2016-02-04T18:00:00+00:00"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
