/**
 * Created by liguoxin on 2017/2/10.
 * @flow
 */
import type {
  VerifyOrder,
  VerifyOrderConfig,
  VerifyOrderConfigFactory,
} from 'jverify';


const exportObj: VerifyOrderConfigFactory = {
  create(mockName: string,
    verifyOrder: VerifyOrder): VerifyOrderConfig {
    return {
      mockName,
      verifyOrder,
    };
  },
};
module.exports = exportObj;
