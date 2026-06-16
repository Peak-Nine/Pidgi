# deals.lose

> Source: https://developer.focus.teamleader.eu/docs/api/deals-lose

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deals](/docs/api/deals)
  * deals.lose



# deals.lose
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/deals.lose

Mark a deal as lost.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`460df7b2-fe82-4c6c-b215-6d0a1bd3c742`

**reason_id** string

**Example:**`da4c902f-2ae5-4c1f-be6f-b50308aabc5c`

**extra_info** string

**Example:**`Not ready for a change, decision postponed`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/deals.lose");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"460df7b2-fe82-4c6c-b215-6d0a1bd3c742\",\n  \"reason_id\": \"da4c902f-2ae5-4c1f-be6f-b50308aabc5c\",\n  \"extra_info\": \"Not ready for a change, decision postponed\"\n}", null, "application/json");  
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
      "id": "460df7b2-fe82-4c6c-b215-6d0a1bd3c742",
      "reason_id": "da4c902f-2ae5-4c1f-be6f-b50308aabc5c",
      "extra_info": "Not ready for a change, decision postponed"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
