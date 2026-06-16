# events.cancel

> Source: https://developer.focus.teamleader.eu/docs/api/events-cancel

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Calendar events](/docs/api/calendar-events)
  * events.cancel



# events.cancel
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/events.cancel

Cancel a calendar event (for all attendees).

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`b519491e-ca80-4efb-bb7b-3f08544936b0`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/events.cancel");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"b519491e-ca80-4efb-bb7b-3f08544936b0\"\n}", null, "application/json");  
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
      "id": "b519491e-ca80-4efb-bb7b-3f08544936b0"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
