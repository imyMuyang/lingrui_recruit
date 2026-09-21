import torch
import pandas as pd
from torch.utils.data import Dataset, DataLoader, random_split
from torch import nn
import data
import matplotlib.pyplot as plt

torch.manual_seed(42)


class TitanicDataset(Dataset):
    def __init__(self, df: pd.DataFrame):
        self.features = torch.tensor(df.iloc[:, 2:].values, dtype=torch.float32)
        self.labels = torch.tensor(df.iloc[:, 1].values, dtype=torch.long)

    def __len__(self):
        return len(self.features)

    def __getitem__(self, index):
        return self.features[index], self.labels[index]


class MLP(nn.Module):
    def __init__(self, input_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(16, 2),
        )

    def forward(self, x):
        return self.net(x)


def getModel():
    print("从零开始训练，从本地读取处理后数据……")
    full = TitanicDataset(pd.read_csv("./data/data.csv"))
    train_size = int(0.8 * len(full))
    test_size = len(full) - train_size
    train_dataset, test_dataset = random_split(full, [train_size, test_size])
    train_loader = DataLoader(train_dataset, 32, True)
    test_loader = DataLoader(test_dataset, 32, False)

    epochs = 100
    model = MLP(full.features.shape[1])
    criterion = torch.nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    epochdata = []
    print(f"准备开始训练，共 {epochs} 轮")
    training_acc_list = []
    for epoch in range(epochs):
        model.train()
        training_loss = 0
        correct = total = 0
        for features, labels in train_loader:
            optimizer.zero_grad()
            outputs = model(features)
            loss = criterion(outputs, labels)
            loss.backward()
            training_loss += loss.item()
            preds = model(features).argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            optimizer.step()
        training_acc_list.append(correct / total)
        training_loss = training_loss / len(train_dataset)
        model.eval()
        correct = total = 0
        with torch.no_grad():
            for features, labels in test_loader:
                preds = model(features).argmax(dim=1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)
        print(
            f"第 {epoch+1} 轮训练 Loss 为 {training_loss:.4f}，测试准确率为 {correct/total:.4f}"
        )
        epochdata.append(
            {"epoch": epoch, "loss": training_loss, "acc": (correct / total)}
        )

    plt.title("Training Loss Curve")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    loss_list = []
    for i in range(len(epochdata)):
        loss_list.append(epochdata[i]["loss"])
    plt.plot(loss_list, label="Training Loss")
    plt.legend()
    plt.savefig("./docs/images/Loss-Epoch.png")
    print("保存了 Loss-Epoch 图像！")
    test_acc_list = []
    for i in range(len(epochdata)):
        test_acc_list.append(epochdata[i]["acc"])
    plt.clf()
    plt.title("Accuracy Curve")
    plt.xlabel("Epoch")
    plt.ylabel("Acc")
    plt.plot(training_acc_list,label = "Training Acc")
    plt.plot(test_acc_list, label="Test Acc", ls="dotted")
    plt.legend()
    plt.savefig("./docs/images/Acc-Epoch.png")
    print("保存了 Acc-Epoch 图像！")
    torch.save(model.state_dict(), "./src/model/weight.pth")
    print("保存了模型权重！")


def checkModel():
    print("加载本地已有的模型权重……")
    full = TitanicDataset(pd.read_csv("./data/data.csv"))
    loader = DataLoader(full, 32, True)
    model = MLP(full.features.shape[1])
    model.load_state_dict(torch.load("./src/model/weight.pth"))
    model.eval()
    correct = total = 0
    with torch.no_grad():
        for features, labels in loader:
            preds = model(features).argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
    acc = correct / total
    print(f"模型在给定数据上的准确率为 {acc:.4f}")
