# reservations.update

> Source: https://developer.focus.teamleader.eu/docs/api/reservations-update

  * [](/)
  * [API Reference](/docs/api)
  * Planning
  * [Reservations](/docs/api/reservations)
  * reservations.update



# reservations.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/reservations.update

Update an existing reservation.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`01878019-c72c-70dc-b097-7e519c775e35`

**date** string

**Example:**`2024-01-12`

**duration** object

**unit** string

**Possible values:** [`minutes`]

**Example:**`minutes`

**value** number

**Example:**`60`

**assignee** object

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/reservations.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"019a3012-c800-7109-ae63-0ab5bcd3b484\",\n  \"date\": \"2024-01-01\",\n  \"duration\": {\n    \"value\": 120,\n    \"unit\": \"minutes\"\n  }\n}", null, "application/json");  
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
      "id": "019a3012-c800-7109-ae63-0ab5bcd3b484",
      "date": "2024-01-01",
      "duration": {
        "value": 120,
        "unit": "minutes"
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
