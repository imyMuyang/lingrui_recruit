import torch
import csv
from io import StringIO
from train import MLP, TitanicDataset
from data import proceedOrigin
from torch.utils.data import DataLoader
import pandas as pd


def predict():
    sample = '1,0,3,"Braund, Mr. Owen Harris",male,22,1,0,A/5 21171,7.25,,S'
    data = input(f"请按照 train.csv 中的格式输入一行数据，例如\n{sample}\n")
    reader = csv.reader(
        StringIO(
            f"PassengerId,Survived,Pclass,Name,Sex,Age,SibSp,Parch,Ticket,Fare,Cabin,Embarked\n{data}"
        )
    )
    with open("./data/data.csv", "w", newline="") as output:
        writer = csv.writer(output)
        for row in reader:
            writer.writerow(row)
    proceedOrigin("./data/data.csv")
    full = TitanicDataset(pd.read_csv("./data/data.csv"))
    loader = DataLoader(full, 32, True)
    model = MLP(full.features.shape[1])
    model.load_state_dict(torch.load("./src/model/weight.pth"))
    model.eval()
    with torch.no_grad():
        for features, labels in loader:
            preds = model(features).argmax(dim=1)
            print(
                f"预测其{"存活" if preds.item()==1 else "死亡"}，实际{"存活" if labels.item()==1 else "死亡"}，预测{"正确" if preds.item()==labels.item() else "错误"}。"
            )
