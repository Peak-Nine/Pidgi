# subscriptions.deactivate

> Source: https://developer.focus.teamleader.eu/docs/api/subscriptions-deactivate

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Subscriptions](/docs/api/subscriptions)
  * subscriptions.deactivate



# subscriptions.deactivate
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/subscriptions.deactivate

Deactivate a subscription.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`46156648-87c6-478d-8aa7-1dc3a00dacab`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/subscriptions.deactivate");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"46156648-87c6-478d-8aa7-1dc3a00dacab\"\n}", null, "application/json");  
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
      "id": "46156648-87c6-478d-8aa7-1dc3a00dacab"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
