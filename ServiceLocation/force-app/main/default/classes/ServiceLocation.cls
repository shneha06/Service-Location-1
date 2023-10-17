public class ServiceLocation {
     @AuraEnabled (cacheable=true)
    public static Case fetchDetails(String recordId){
            System.debug('recordId');
            
            return [SELECT Id,Location__latitude__s, Location__longitude__s, Account.BillingAddress
                    FROM Case WHERE Id =:recordId LIMIT 1];
    } 

    
     @AuraEnabled
    public static void updateLocation(String recordId, Decimal latitude, Decimal longitude) {
        Case cs = new Case(Id = recordId);
        cs.Location__latitude__s = latitude;
        cs.Location__longitude__s = longitude;
        update cs;
    }
}