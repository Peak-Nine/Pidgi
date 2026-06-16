# timeTracking.delete

> Source: https://developer.focus.teamleader.eu/docs/api/time-tracking-delete

  * [](/)
  * [API Reference](/docs/api)
  * Time Tracking
  * [Time Tracking](/docs/api/time-tracking)
  * timeTracking.delete



# timeTracking.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/timeTracking.delete

Delete a tracked time.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`6caeea11-aa83-4da9-9859-5b62bbf3a476`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/timeTracking.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"6caeea11-aa83-4da9-9859-5b62bbf3a476\"\n}", null, "application/json");  
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
      "id": "6caeea11-aa83-4da9-9859-5b62bbf3a476"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
