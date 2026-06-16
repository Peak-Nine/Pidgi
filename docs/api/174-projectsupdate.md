# projects.update

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-projects-update

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Projects](/docs/api/legacy-projects)
  * projects.update



# projects.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects.update

Update a project.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`dcc2e8ed-51be-4cb6-9c01-034aedac86fd`

**title** string

**Example:**`New company website`

**description** string

**status** string

**Possible values:** [`active`, `on_hold`, `done`, `cancelled`]

**starts_on** string

**Example:**`2016-02-04`

**customer** objectnullable

Null will unlink the customer from the project

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**budget** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**purchase_order_number** stringnullable

**Example:**`000023`

**custom_fields** object[]

  * Array [

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * number
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"dcc2e8ed-51be-4cb6-9c01-034aedac86fd\",\n  \"title\": \"New company website\",\n  \"description\": \"\",\n  \"status\": \"active\",\n  \"starts_on\": \"2016-02-04\",\n  \"customer\": {\n    \"type\": \"company\",\n    \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n  },\n  \"budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"purchase_order_number\": \"000023\",\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ]\n}", null, "application/json");  
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
      "id": "dcc2e8ed-51be-4cb6-9c01-034aedac86fd",
      "title": "New company website",
      "description": "",
      "status": "active",
      "starts_on": "2016-02-04",
      "customer": {
        "type": "company",
        "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
      },
      "budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "purchase_order_number": "000023",
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
