# deals.delete

> Source: https://developer.focus.teamleader.eu/docs/api/deals-delete

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deals](/docs/api/deals)
  * deals.delete



# deals.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/deals.delete

Delete a deal.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`4e235f27-0af0-40e5-82f3-d32d0aa9edb3`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/deals.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"4e235f27-0af0-40e5-82f3-d32d0aa9edb3\"\n}", null, "application/json");  
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
      "id": "4e235f27-0af0-40e5-82f3-d32d0aa9edb3"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
