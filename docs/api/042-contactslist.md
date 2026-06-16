# contacts.list

> Source: https://developer.focus.teamleader.eu/docs/api/contacts-list

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Contacts](/docs/api/contacts)
  * contacts.list



# contacts.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/contacts.list

Get a list of contacts.

## Request​

  * application/json



### Body

**filter** object

**email** object

**type** stringrequired

**Possible values:** [`primary`]

**Example:**`primary`

**email** stringrequired

**Example:**`info@piedpiper.eu`

**ids** string[]

**company_id** string

**Example:**`cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5`

**term** string

Filters on first_name, last_name, email and telephone

**Example:**`James`

**updated_since** string

**Example:**`2016-02-04T16:44:33+00:00`

**tags** string[]

Filters on contacts coupled to all given tags

**status** string

**Possible values:** [`active`, `deactivated`]

**Example:**`active`

**marketing_mails_consent** boolean

**Example:**`false`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`added_at`, `name`, `updated_at`]

**order** Order (string)

**Possible values:** [`asc`, `desc`]

  * ]

**includes** string

Comma-separated list of optional includes

**Example:**`custom_fields,price_list`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**Example:**`2a39e420-3ba3-4384-8024-fa702ef99c9f`

**first_name** string

**Example:**`Erlich`

**last_name** string

**Example:**`Bachman`

**status** string

**Possible values:** [`active`, `deactivated`]

**Example:**`active`

**salutation** string

**Example:**`Mr`

**emails** object[]

  * Array [

**type** string

**Possible values:** [`primary`]

**Example:**`primary`

**email** string

**Example:**`info@piedpiper.eu`

  * ]

**telephones** object[]

  * Array [

**type** string

**Possible values:** [`phone`, `mobile`, `fax`]

**Example:**`phone`

**number** string

**Example:**`092980615`

  * ]

**website** string

**Example:**`https://piedpiper.com`

**primary_address** object

**line_1** stringnullable

**Example:**`Dok Noord 3A 101`

**postal_code** stringnullable

**Example:**`9000`

**city** stringnullable

**Example:**`Ghent`

**country** string

**Example:**`BE`

**area_level_two** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`area_level_two`

**gender** Gender (string)nullable

**Possible values:** [`female`, `male`, `non_binary`, `prefers_not_to_say`, `unknown`]

**Example:**`unknown`

**birthdate** string

**Example:**`1987-04-25`

**iban** string

**Example:**`BE12123412341234`

**bic** string

**Example:**`BICBANK`

**national_identification_number** string

**Example:**`86792345-L`

**language** string

**Example:**`en`

**payment_term** objectnullable

**type** string

**Possible values:** [`cash`, `end_of_month`, `after_invoice_date`]

**days** number

Modifier "X" for the above statements. Not required when type is 'cash'.

**invoicing_preferences** object

**electronic_invoicing_address** stringnullable

**tags** string[]

**added_at** string

**Example:**`2016-02-04T16:44:33+00:00`

**updated_at** string

**Example:**`2016-02-05T16:44:33+00:00`

**web_url** string

**Example:**`https://focus.teamleader.eu/contact_detail.php?id=2a39e420-3ba3-4384-8024-fa702ef99c9f`

**marketing_mails_consent** boolean

**Example:**`false`

**custom_fields** object[]

Only included with request parameter `includes=custom_fields`

  * Array [

**definition** object

**type** string

**Example:**`customFieldDefinition`

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * numbers
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

For multiple selection fields

**Example:**`foo`

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

For related Teamleader objects

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

**price_list** object

Only included with request parameter `includes=price_list`

**type** string

**Example:**`priceList`

**id** string

**Example:**`27261187-19c9-081f-b833-021fa5873129`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "2a39e420-3ba3-4384-8024-fa702ef99c9f",  
          "first_name": "Erlich",  
          "last_name": "Bachman",  
          "status": "active",  
          "salutation": "Mr",  
          "emails": [  
            {  
              "type": "primary",  
              "email": "info@piedpiper.eu"  
            }  
          ],  
          "telephones": [  
            {  
              "type": "phone",  
              "number": "092980615"  
            }  
          ],  
          "website": "https://piedpiper.com",  
          "primary_address": {  
            "line_1": "Dok Noord 3A 101",  
            "postal_code": "9000",  
            "city": "Ghent",  
            "country": "BE",  
            "area_level_two": {  
              "type": "area_level_two",  
              "id": "db232cf8-ad4a-024b-941f-15a7a74f0fd2"  
            }  
          },  
          "gender": "unknown",  
          "birthdate": "1987-04-25",  
          "iban": "BE12123412341234",  
          "bic": "BICBANK",  
          "national_identification_number": "86792345-L",  
          "language": "en",  
          "payment_term": {  
            "type": "cash"  
          },  
          "invoicing_preferences": {  
            "electronic_invoicing_address": null  
          },  
          "tags": [  
            "prospect",  
            "expo"  
          ],  
          "marketing_mails_consent": false,  
          "added_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00",  
          "web_url": "https://focus.teamleader.eu/contact_detail.php?id=2a39e420-3ba3-4384-8024-fa702ef99c9f",  
          "custom_fields": [  
            {  
              "definition": {  
                "type": "customFieldDefinition",  
                "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
              },  
              "value": "092980616"  
            }  
          ],  
          "price_list": {  
            "type": "priceList",  
            "id": "5a37d173-78d3-05f3-b018-d51fadc1c5d2"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "2a39e420-3ba3-4384-8024-fa702ef99c9f",  
          "first_name": "Erlich",  
          "last_name": "Bachman",  
          "status": "active",  
          "salutation": "Mr",  
          "emails": [  
            {  
              "type": "primary",  
              "email": "info@piedpiper.eu"  
            }  
          ],  
          "telephones": [  
            {  
              "type": "phone",  
              "number": "092980615"  
            }  
          ],  
          "website": "https://piedpiper.com",  
          "primary_address": {  
            "line_1": "Dok Noord 3A 101",  
            "postal_code": "9000",  
            "city": "Ghent",  
            "country": "BE",  
            "area_level_two": {  
              "type": "area_level_two",  
              "id": "db232cf8-ad4a-024b-941f-15a7a74f0fd2"  
            }  
          },  
          "gender": "unknown",  
          "birthdate": "1987-04-25",  
          "iban": "BE12123412341234",  
          "bic": "BICBANK",  
          "national_identification_number": "86792345-L",  
          "language": "en",  
          "payment_term": {  
            "type": "cash"  
          },  
          "invoicing_preferences": {  
            "electronic_invoicing_address": null  
          },  
          "tags": [  
            "prospect",  
            "expo"  
          ],  
          "marketing_mails_consent": false,  
          "added_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00",  
          "web_url": "https://focus.teamleader.eu/contact_detail.php?id=2a39e420-3ba3-4384-8024-fa702ef99c9f",  
          "custom_fields": [  
            {  
              "definition": {  
                "type": "customFieldDefinition",  
                "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
              },  
              "value": "092980616"  
            }  
          ],  
          "price_list": {  
            "type": "priceList",  
            "id": "5a37d173-78d3-05f3-b018-d51fadc1c5d2"  
          }  
        }  
      ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/contacts.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"email\": {\n      \"type\": \"primary\",\n      \"email\": \"info@piedpiper.eu\"\n    },\n    \"ids\": [\n      \"cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5\",\n      \"f8a57a6f-dd1e-41a3-b8d3-428663f1d09e\"\n    ],\n    \"company_id\": \"cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5\",\n    \"term\": \"James\",\n    \"updated_since\": \"2016-02-04T16:44:33+00:00\",\n    \"tags\": [\n      \"expo\",\n      \"prospect\"\n    ],\n    \"status\": \"active\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"added_at\"\n    }\n  ],\n  \"includes\": \"custom_fields,price_list\"\n}", null, "application/json");  
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

Body

  * Example (from schema)
  * Example


    
    
    {
      "filter": {
        "email": {
          "type": "primary",
          "email": "info@piedpiper.eu"
        },
        "ids": [
          "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",
          "f8a57a6f-dd1e-41a3-b8d3-428663f1d09e"
        ],
        "company_id": "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",
        "term": "James",
        "updated_since": "2016-02-04T16:44:33+00:00",
        "tags": [
          "expo",
          "prospect"
        ],
        "status": "active"
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "added_at"
        }
      ],
      "includes": "custom_fields,price_list"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
