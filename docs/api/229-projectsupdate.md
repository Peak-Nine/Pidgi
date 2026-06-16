# projects.update

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-update

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Projects](/docs/api/projects)
  * projects.update



# projects.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projects.update

Update a project. All attributes except for `id` are optional. Providing `null` will clear that value from the project (for properties that are nullable).

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`0184f276-811b-716d-8b79-17628c9573c6`

**title** string

**Example:**`A different project title`

**description** stringnullable

**Example:**`Another description`

**time_budget** objectnullable

**value** numberrequired

**Example:**`60`

**unit** stringrequired

**Possible values:** [`hours`, `minutes`, `seconds`]

**Example:**`minutes`

**billing_method** object

**value** stringrequired

**Possible values:** [`time_and_materials`, `fixed_price`, `non_billable`]

**Example:**`time_and_materials`

**update_strategy** stringrequired

**Possible values:** [`none`, `cascade`]

**Example:**`none`

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

**fixed_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**start_date** stringnullable

Should not be after end_date if provided

**Example:**`2022-02-23`

**end_date** stringnullable

Should not be before start_date if provided

**Example:**`2022-02-28`

**purchase_order_number** stringnullable

**Example:**`000023`

**company_entity_id** stringnullable

**Example:**`0d0dec5a-7096-4009-be37-07eab117db07`

**color** Color (string)

**Possible values:** [`#00B2B2`, `#008A8C`, `#992600`, `#ED9E00`, `#D157D3`, `#A400B2`, `#0071F2`, `#004DA6`, `#64788F`, `#C0C0C4`, `#82828C`, `#1A1C20`]

**Example:**`#00B2B2`

**custom_fields** object[]

Auto-increment custom fields are not supported on projects.

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projects.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"0184f276-811b-716d-8b79-17628c9573c6\",\n  \"title\": \"A different project title\",\n  \"description\": \"Another description\",\n  \"time_budget\": {\n    \"value\": 60,\n    \"unit\": \"minutes\"\n  },\n  \"billing_method\": {\n    \"value\": \"time_and_materials\",\n    \"update_strategy\": \"none\"\n  },\n  \"external_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"internal_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"fixed_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"start_date\": \"2022-02-23\",\n  \"end_date\": \"2022-02-28\",\n  \"purchase_order_number\": \"000023\",\n  \"company_entity_id\": \"0d0dec5a-7096-4009-be37-07eab117db07\",\n  \"color\": \"#00B2B2\",\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ]\n}", null, "application/json");  
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
      "id": "0184f276-811b-716d-8b79-17628c9573c6",
      "title": "A different project title",
      "description": "Another description",
      "time_budget": {
        "value": 60,
        "unit": "minutes"
      },
      "billing_method": {
        "value": "time_and_materials",
        "update_strategy": "none"
      },
      "external_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "internal_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "fixed_price": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "start_date": "2022-02-23",
      "end_date": "2022-02-28",
      "purchase_order_number": "000023",
      "company_entity_id": "0d0dec5a-7096-4009-be37-07eab117db07",
      "color": "#00B2B2",
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
