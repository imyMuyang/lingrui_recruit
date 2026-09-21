print("请稍后，正在预处理数据……")
import data,train,predict
data.proceedOrigin("./train.csv") # 数据处理
while True:
    ans = input("===\n请选择需要执行的操作\n1. 从零开始训练并保存模型\n2. 加载保存的模型并对整个数据集做预测\n3. 预测新数据\nE. 退出\n===\n")
    match ans:
        case "1":
            train.getModel() # 训练模型
        case "2":
            train.checkModel() # 加载模型并对整个数据集做分析
        case "3":
            predict.predict()
        case "E":
            print("正在退出……")
            exit(0)
        case _:
            continue