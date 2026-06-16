# deals.update

> Source: https://developer.focus.teamleader.eu/docs/api/deals-update

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deals](/docs/api/deals)
  * deals.update



# deals.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/deals.update

Update a deal.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`65a35860-dcca-4850-9fd6-47ff08469e0c`

**lead** object

**customer** objectrequired

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**contact_person_id** string

**Example:**`b38ebb9b-6e46-4bf4-a1e2-af747d6b64ae`

**title** string

**Example:**`Interesting business deal`

**summary** stringnullable

**Example:**`Additional information`

**source_id** stringnullable

**Example:**`b38ebb9b-6e46-4bf4-a1e2-af747d6b64ae`

**department_id** stringnullable

**Example:**`6a6343fc-fdd8-4bc0-aa69-3a004c710e87`

**responsible_user_id** stringnullable

**Example:**`98b2863e-7b01-4232-82f5-ede1f0b9db22`

**estimated_value** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**estimated_probability** numbernullable

A number between 0 and 1 (inclusive)

**Example:**`0.75`

**estimated_closing_date** stringnullable

**Example:**`2017-05-09`

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

**currency** object

**code** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**exchange_rate** numberrequired

**Example:**`1.1238`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/deals.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"65a35860-dcca-4850-9fd6-47ff08469e0c\",\n  \"lead\": {\n    \"customer\": {\n      \"type\": \"contact\",\n      \"id\": \"09e5d75f-f817-4872-9723-57fbb8ff710d\"\n    },\n    \"contact_person_id\": \"b38ebb9b-6e46-4bf4-a1e2-af747d6b64ae\"\n  },\n  \"title\": \"Interesting business deal\",\n  \"summary\": \"Additional information\",\n  \"source_id\": \"b38ebb9b-6e46-4bf4-a1e2-af747d6b64ae\",\n  \"department_id\": \"6a6343fc-fdd8-4bc0-aa69-3a004c710e87\",\n  \"responsible_user_id\": \"98b2863e-7b01-4232-82f5-ede1f0b9db22\",\n  \"estimated_value\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"estimated_probability\": 0.75,\n  \"estimated_closing_date\": \"2017-05-09\",\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ],\n  \"currency\": {\n    \"code\": \"EUR\",\n    \"exchange_rate\": 1.1238\n  }\n}", null, "application/json");  
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
      "id": "65a35860-dcca-4850-9fd6-47ff08469e0c",
      "lead": {
        "customer": {
          "type": "contact",
          "id": "09e5d75f-f817-4872-9723-57fbb8ff710d"
        },
        "contact_person_id": "b38ebb9b-6e46-4bf4-a1e2-af747d6b64ae"
      },
      "title": "Interesting business deal",
      "summary": "Additional information",
      "source_id": "b38ebb9b-6e46-4bf4-a1e2-af747d6b64ae",
      "department_id": "6a6343fc-fdd8-4bc0-aa69-3a004c710e87",
      "responsible_user_id": "98b2863e-7b01-4232-82f5-ede1f0b9db22",
      "estimated_value": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "estimated_probability": 0.75,
      "estimated_closing_date": "2017-05-09",
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ],
      "currency": {
        "code": "EUR",
        "exchange_rate": 1.1238
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
