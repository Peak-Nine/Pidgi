# reservations.delete

> Source: https://developer.focus.teamleader.eu/docs/api/reservations-delete

  * [](/)
  * [API Reference](/docs/api)
  * Planning
  * [Reservations](/docs/api/reservations)
  * reservations.delete



# reservations.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/reservations.delete

Delete a reservation.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`01878019-c72c-70dc-b097-7e519c775e35`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/reservations.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"019a3012-c800-7109-ae63-0ab5bcd3b484\"\n}", null, "application/json");  
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
      "id": "019a3012-c800-7109-ae63-0ab5bcd3b484"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
