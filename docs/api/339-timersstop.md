# timers.stop

> Source: https://developer.focus.teamleader.eu/docs/api/timers-stop

  * [](/)
  * [API Reference](/docs/api)
  * Time Tracking
  * [Timers](/docs/api/timers)
  * timers.stop



# timers.stop
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/timers.stop

Stop the current timer. This will add a new time tracking in the background.

## Request​

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
        "type": "timeTracking",  
        "id": "4ff475b2-f45b-4803-800e-350b9c02aeca"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "timeTracking",  
        "id": "4ff475b2-f45b-4803-800e-350b9c02aeca"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/timers.stop");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
