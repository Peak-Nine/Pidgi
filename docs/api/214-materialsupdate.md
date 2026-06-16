# materials.update

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-materials-update

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Materials](/docs/api/materials)
  * materials.update



# materials.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/materials.update

Update a material. All attributes except for `id` are optional. Providing `null` will clear that value from the project (for properties that are nullable).

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`ff19a113-50ba-4afc-9fff-2e5c5c5a5485`

**title** string

**Example:**`WD-40® Multi-Use Product Industrial Size`

**description** stringnullable

**Example:**`Protects metal from rust and corrosion, penetrates stuck parts, displaces moisture and lubricates almost anything.`

**status** string

**Possible values:** [`to_do`, `in_progress`, `on_hold`, `done`]

**Example:**`on_hold`

**billing_method** string

**Possible values:** [`fixed_price`, `unit_price`, `non_billable`]

**Example:**`unit_price`

**quantity** numbernullable

**quantity_estimated** numbernullable

**unit_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**unit_cost** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**unit_id** stringnullable

**fixed_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**start_date** stringnullable

**Example:**`2023-01-18`

**end_date** stringnullable

**Example:**`2023-03-22`

**product_id** stringnullable

**Example:**`1c5cf7a1-7248-469c-9dcd-9f0581321ec2`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/materials.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"ff19a113-50ba-4afc-9fff-2e5c5c5a5485\",\n  \"title\": \"WD-40® Multi-Use Product Industrial Size\",\n  \"description\": \"Protects metal from rust and corrosion, penetrates stuck parts, displaces moisture and lubricates almost anything.\",\n  \"status\": \"on_hold\",\n  \"billing_method\": \"unit_price\",\n  \"unit_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"unit_cost\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"fixed_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"external_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"internal_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"start_date\": \"2023-01-18\",\n  \"end_date\": \"2023-03-22\",\n  \"product_id\": \"1c5cf7a1-7248-469c-9dcd-9f0581321ec2\"\n}", null, "application/json");  
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
      "id": "ff19a113-50ba-4afc-9fff-2e5c5c5a5485",
      "title": "WD-40® Multi-Use Product Industrial Size",
      "description": "Protects metal from rust and corrosion, penetrates stuck parts, displaces moisture and lubricates almost anything.",
      "status": "on_hold",
      "billing_method": "unit_price",
      "unit_price": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "unit_cost": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "fixed_price": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "external_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "internal_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "start_date": "2023-01-18",
      "end_date": "2023-03-22",
      "product_id": "1c5cf7a1-7248-469c-9dcd-9f0581321ec2"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
