# projects.create

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-create

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Projects](/docs/api/projects)
  * projects.create



# projects.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projects.create

Create a new project. Only `title` is required. All the other fields are optional.

## Request​

  * application/json



### Body**required**

**title** stringrequired

**Example:**`My cool new project`

**description** string

**Example:**`My project description`

**owner_ids** string[]

The creator is automatically added as an owner, these are additional owners to be added

**time_budget** object

**value** numberrequired

**Example:**`60`

**unit** stringrequired

**Possible values:** [`hours`, `minutes`, `seconds`]

**Example:**`minutes`

**billing_method** string

**Possible values:** [`time_and_materials`, `fixed_price`, `non_billable`]

**Example:**`time_and_materials`

**external_budget** objectnullable

Also known as "budget". Value set by user to compare with price. Must be higher than or equal to zero, and lower than 100000000000 (100 billion). Only allowed for time_and_materials billing method. Currently only EUR is supported.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

Also known as "cost budget". Value set by user to compare with cost. Must be higher than or equal to zero, and lower than 100000000000 (100 billion).

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**fixed_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**start_date** string

Should not be after end_date if provided

**Example:**`2022-02-23`

**end_date** string

Should not be before start_date if provided

**Example:**`2022-02-28`

**purchase_order_number** string

**Example:**`000023`

**company_entity_id** string

**Example:**`0d0dec5a-7096-4009-be37-07eab117db07`

**color** Color (string)

**Possible values:** [`#00B2B2`, `#008A8C`, `#992600`, `#ED9E00`, `#D157D3`, `#A400B2`, `#0071F2`, `#004DA6`, `#64788F`, `#C0C0C4`, `#82828C`, `#1A1C20`]

**Example:**`#00B2B2`

**customers** object[]

  * Array [

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

  * ]

**assignees** object[]

  * Array [

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

  * ]

**deal_ids** string[]

**quotation_ids** string[]

**initial_time_tracked** object

**value** numberrequired

**Example:**`60`

**unit** stringrequired

**Possible values:** [`hours`, `minutes`, `seconds`]

**Example:**`minutes`

**initial_price** object

Must be higher than or equal to zero, and lower than 100000000000 (100 billion).

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**initial_cost** object

Must be higher than or equal to zero, and lower than 100000000000 (100 billion).

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**initial_amount_billed** object

Must be higher than or equal to zero, and lower than 100000000000 (100 billion).

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**initial_amount_paid** object

Must be higher than or equal to zero, and lower than 100000000000 (100 billion).

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

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

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "nextgenProject",  
        "id": "49b403be-a32e-0901-9b1c-25214f9027c6"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "nextgenProject",  
        "id": "49b403be-a32e-0901-9b1c-25214f9027c6"  
      }  
    }  
    

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projects.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"title\": \"My cool new project\",\n  \"description\": \"My project description\",\n  \"owner_ids\": [\n    \"47e7e4a2-607d-465b-a121-7bdc9c64ade7\",\n    \"d8ebc8a5-800f-4714-97bb-3947a7ec274d\"\n  ],\n  \"time_budget\": {\n    \"value\": 43200,\n    \"unit\": \"minutes\"\n  },\n  \"external_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"internal_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"fixed_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"start_date\": \"2022-02-23\",\n  \"end_date\": \"2022-02-28\",\n  \"purchase_order_number\": \"000023\",\n  \"company_entity_id\": \"0d0dec5a-7096-4009-be37-07eab117db07\",\n  \"color\": \"#00B2B2\",\n  \"customers\": [\n    {\n      \"type\": \"company\",\n      \"id\": \"9cb3e568-3931-4b8f-8db8-5a002e8cf253\"\n    }\n  ],\n  \"assignees\": [\n    {\n      \"type\": \"user\",\n      \"id\": \"66abace2-62af-0836-a927-fe3f44b9b47b\"\n    }\n  ],\n  \"deal_ids\": [\n    \"3709b7e9-7722-4d2d-a663-b480789bafe4\",\n    \"39fb2767-90e0-4fe4-9bac-a244bee6552c\"\n  ],\n  \"quotation_ids\": [\n    \"e8e8e969-2054-49ee-81d1-47453de2aebb\",\n    \"fc41c04f-1841-4238-a31b-42c48c57713e\"\n  ],\n  \"initial_time_tracked\": {\n    \"value\": 43200,\n    \"unit\": \"minutes\"\n  },\n  \"initial_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"initial_cost\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"initial_amount_billed\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"initial_amount_paid\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ]\n}", null, "application/json");  
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
      "title": "My cool new project",
      "description": "My project description",
      "owner_ids": [
        "47e7e4a2-607d-465b-a121-7bdc9c64ade7",
        "d8ebc8a5-800f-4714-97bb-3947a7ec274d"
      ],
      "time_budget": {
        "value": 43200,
        "unit": "minutes"
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
      "customers": [
        {
          "type": "company",
          "id": "9cb3e568-3931-4b8f-8db8-5a002e8cf253"
        }
      ],
      "assignees": [
        {
          "type": "user",
          "id": "66abace2-62af-0836-a927-fe3f44b9b47b"
        }
      ],
      "deal_ids": [
        "3709b7e9-7722-4d2d-a663-b480789bafe4",
        "39fb2767-90e0-4fe4-9bac-a244bee6552c"
      ],
      "quotation_ids": [
        "e8e8e969-2054-49ee-81d1-47453de2aebb",
        "fc41c04f-1841-4238-a31b-42c48c57713e"
      ],
      "initial_time_tracked": {
        "value": 43200,
        "unit": "minutes"
      },
      "initial_price": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "initial_cost": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "initial_amount_billed": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "initial_amount_paid": {
        "amount": 123.3,
        "currency": "EUR"
      },
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
